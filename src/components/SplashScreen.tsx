import { useEffect, useState, useRef, useCallback } from "react";
import ayokaSplashLogo from "@/assets/ayoka-logo.png";
import { useHaptics } from "@/hooks/useHaptics";
import { useSplashSound } from "@/hooks/useSplashSound";

interface SplashScreenProps {
  onFinish: () => void;
  isShortVersion?: boolean;
}

const SplashScreen = ({ onFinish, isShortVersion = false }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const haptics = useHaptics();
  const { playStartupSound } = useSplashSound();
  const hasFinished = useRef(false);

  const duration = isShortVersion ? 800 : 2500;
  const fadeOutDuration = isShortVersion ? 400 : 600;

  const safeFinish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (!isShortVersion) {
      try {
        playStartupSound();
        haptics.medium();
      } catch (e) {
        console.log("Splash effects error:", e);
      }

      const phase1 = setTimeout(() => setAnimationPhase(1), 150);
      const phase2 = setTimeout(() => setAnimationPhase(2), 400);
      const phase3 = setTimeout(() => setAnimationPhase(3), 800);
      const phase4 = setTimeout(() => setAnimationPhase(4), 1200);

      return () => {
        clearTimeout(phase1);
        clearTimeout(phase2);
        clearTimeout(phase3);
        clearTimeout(phase4);
      };
    } else {
      try {
        haptics.light();
      } catch (e) {
        console.log("Haptics not available");
      }
    }
  }, [isShortVersion, haptics, playStartupSound]);

  useEffect(() => {
    let finishTimer: ReturnType<typeof setTimeout> | null = null;

    const timer = setTimeout(() => {
      setFadeOut(true);
      if (!isShortVersion) {
        try {
          haptics.success();
        } catch (e) {
          console.log("Haptics not available");
        }
      }
      finishTimer = setTimeout(() => {
        safeFinish();
      }, fadeOutDuration);
    }, duration);

    const fallbackTimer = setTimeout(() => {
      console.log("Splash fallback triggered");
      safeFinish();
    }, duration + fadeOutDuration + 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [haptics, isShortVersion, duration, fadeOutDuration, safeFinish]);

  // Short version: quick bright splash
  if (isShortVersion) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-500 ${
          fadeOut ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
        style={{
          background: "linear-gradient(145deg, #FFF8E7 0%, #FFE4B5 30%, #FFDAB9 60%, #FFD4A3 100%)",
        }}
      >
        {/* Floating bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${40 + i * 20}px`,
                height: `${40 + i * 20}px`,
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                background: `radial-gradient(circle, ${
                  i % 2 === 0 ? 'rgba(255, 165, 0, 0.3)' : 'rgba(255, 140, 0, 0.25)'
                } 0%, transparent 70%)`,
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div 
            className="absolute inset-0 -m-16 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(255, 165, 0, 0.4) 0%, rgba(255, 200, 100, 0.2) 50%, transparent 70%)",
              animation: "pulse-soft 2s ease-in-out infinite",
            }}
          />
          <img
            src={ayokaSplashLogo}
            alt="AYOKA MARKET"
            className="w-56 md:w-72 drop-shadow-2xl object-contain relative z-10 animate-fade-in"
            style={{ 
              filter: "drop-shadow(0 8px 32px rgba(255, 140, 0, 0.4))"
            }}
          />
        </div>

        <style>{`
          @keyframes pulse-soft {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.9; }
          }
        `}</style>
      </div>
    );
  }

  // Full version: Joyful, warm and vibrant splash
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-800 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        background: "linear-gradient(145deg, #FFF8E7 0%, #FFE8CC 25%, #FFDAB9 50%, #FFD093 75%, #FFC87C 100%)",
      }}
    >
      {/* Animated sunshine rays */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% -20%, rgba(255, 200, 50, 0.35) 0%, transparent 60%)",
        }}
      />

      {/* Floating colorful circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large warm bubble top-right */}
        <div 
          className={`absolute rounded-full transition-all duration-1000 ${
            animationPhase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            width: "400px",
            height: "400px",
            top: "-10%",
            right: "-5%",
            background: "radial-gradient(circle, rgba(255, 180, 100, 0.4) 0%, rgba(255, 150, 50, 0.2) 40%, transparent 70%)",
            animation: "float-bubble 6s ease-in-out infinite",
          }}
        />
        
        {/* Orange bubble bottom-left */}
        <div 
          className={`absolute rounded-full transition-all duration-1000 delay-200 ${
            animationPhase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            width: "350px",
            height: "350px",
            bottom: "-8%",
            left: "-8%",
            background: "radial-gradient(circle, rgba(255, 140, 0, 0.35) 0%, rgba(255, 180, 80, 0.15) 50%, transparent 70%)",
            animation: "float-bubble 8s ease-in-out infinite reverse",
          }}
        />

        {/* Peach bubble top-left */}
        <div 
          className={`absolute rounded-full transition-all duration-1000 delay-300 ${
            animationPhase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            width: "250px",
            height: "250px",
            top: "15%",
            left: "-3%",
            background: "radial-gradient(circle, rgba(255, 200, 150, 0.4) 0%, transparent 60%)",
            animation: "float-bubble 7s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />

        {/* Golden bubble center-right */}
        <div 
          className={`absolute rounded-full transition-all duration-1000 delay-400 ${
            animationPhase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            width: "200px",
            height: "200px",
            top: "45%",
            right: "-2%",
            background: "radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 60%)",
            animation: "float-bubble 5s ease-in-out infinite reverse",
            animationDelay: "0.5s",
          }}
        />

        {/* Rising sparkles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full transition-opacity duration-700 ${
              animationPhase >= 2 ? "opacity-100" : "opacity-0"
            }`}
            style={{
              width: `${4 + (i % 4) * 3}px`,
              height: `${4 + (i % 4) * 3}px`,
              left: `${5 + i * 6}%`,
              bottom: "-5%",
              background: i % 3 === 0 
                ? "rgba(255, 215, 0, 0.8)" 
                : i % 3 === 1 
                  ? "rgba(255, 165, 0, 0.7)" 
                  : "rgba(255, 200, 100, 0.9)",
              boxShadow: `0 0 ${6 + i % 3 * 4}px ${
                i % 3 === 0 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 165, 0, 0.5)'
              }`,
              animation: `sparkle-rise ${4 + i * 0.3}s ease-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        {/* Twinkling stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`star-${i}`}
            className={`absolute transition-opacity duration-500 ${
              animationPhase >= 3 ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              animation: `twinkle ${1.5 + i * 0.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" 
                fill={i % 2 === 0 ? "rgba(255, 200, 50, 0.9)" : "rgba(255, 165, 0, 0.8)"}
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Rotating sun rays behind logo */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-1000 ${
          animationPhase >= 2 ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: "600px",
          height: "600px",
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              rgba(255, 200, 50, 0.15) 15deg,
              transparent 30deg,
              rgba(255, 180, 50, 0.12) 45deg,
              transparent 60deg,
              rgba(255, 200, 50, 0.15) 75deg,
              transparent 90deg,
              rgba(255, 180, 50, 0.12) 105deg,
              transparent 120deg,
              rgba(255, 200, 50, 0.15) 135deg,
              transparent 150deg,
              rgba(255, 180, 50, 0.12) 165deg,
              transparent 180deg,
              rgba(255, 200, 50, 0.15) 195deg,
              transparent 210deg,
              rgba(255, 180, 50, 0.12) 225deg,
              transparent 240deg,
              rgba(255, 200, 50, 0.15) 255deg,
              transparent 270deg,
              rgba(255, 180, 50, 0.12) 285deg,
              transparent 300deg,
              rgba(255, 200, 50, 0.15) 315deg,
              transparent 330deg,
              rgba(255, 180, 50, 0.12) 345deg,
              transparent 360deg
            )`,
            animation: "sun-rotate 25s linear infinite",
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 relative z-10">
        
        {/* Logo container with warm glow */}
        <div 
          className={`relative transition-all duration-700 ease-out ${
            animationPhase >= 1 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-12 scale-90"
          }`}
          style={{
            animation: animationPhase >= 1 ? "logo-bounce 0.6s ease-out" : "none",
          }}
        >
          {/* Warm outer glow */}
          <div 
            className={`absolute inset-0 -m-24 rounded-full transition-all duration-1000 ${
              animationPhase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
            style={{
              background: "radial-gradient(circle, rgba(255, 180, 50, 0.4) 0%, rgba(255, 140, 0, 0.15) 40%, transparent 65%)",
              animation: "glow-pulse 2.5s ease-in-out infinite",
            }}
          />

          {/* Inner bright glow */}
          <div 
            className="absolute inset-0 -m-12 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, rgba(255, 165, 0, 0.3) 50%, transparent 70%)",
              animation: "inner-pulse 2s ease-in-out infinite",
            }}
          />

          {/* Logo */}
          <div className="relative">
            <img
              src={ayokaSplashLogo}
              alt="AYOKA MARKET"
              className="w-72 md:w-96 object-contain relative z-10"
              style={{ 
                filter: "drop-shadow(0 8px 40px rgba(255, 140, 0, 0.5)) drop-shadow(0 4px 20px rgba(255, 180, 80, 0.4))"
              }}
            />
            
            {/* Shine sweep effect */}
            <div
              className={`absolute inset-0 z-20 rounded-2xl overflow-hidden transition-opacity duration-500 ${
                animationPhase >= 3 ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 45%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.4) 55%, transparent 70%)",
                  backgroundSize: "300% 100%",
                  animation: "shine-sweep 2s ease-in-out infinite",
                  animationDelay: "0.3s",
                }}
              />
            </div>
          </div>
        </div>

        {/* Tagline with cheerful style */}
        <div 
          className={`flex flex-col items-center gap-3 transition-all duration-700 delay-200 ${
            animationPhase >= 3 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-6"
          }`}
        >
          {/* Decorative elements */}
          <div className="flex items-center gap-3">
            <div 
              className={`h-0.5 rounded-full transition-all duration-700 ${
                animationPhase >= 4 ? "w-12 opacity-100" : "w-0 opacity-0"
              }`}
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 140, 0, 0.7), rgba(255, 180, 50, 0.5))",
              }}
            />
            <div 
              className="w-2 h-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, #FFA500, #FF8C00)",
                boxShadow: "0 0 10px rgba(255, 165, 0, 0.6)",
                animation: "dot-glow 1.5s ease-in-out infinite",
              }}
            />
            <div 
              className={`h-0.5 rounded-full transition-all duration-700 ${
                animationPhase >= 4 ? "w-12 opacity-100" : "w-0 opacity-0"
              }`}
              style={{
                background: "linear-gradient(90deg, rgba(255, 180, 50, 0.5), rgba(255, 140, 0, 0.7), transparent)",
              }}
            />
          </div>
          
          <p 
            className={`text-base md:text-lg text-center px-6 font-medium tracking-wide transition-all duration-500 ${
              animationPhase >= 4 ? "opacity-100" : "opacity-0"
            }`}
            style={{ 
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              color: "#8B4513",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.5)",
            }}
          >
            Donnez une seconde vie à vos articles ✨
          </p>
        </div>

        {/* Bouncy loading dots */}
        <div 
          className={`relative mt-4 transition-all duration-500 delay-300 ${
            animationPhase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${
                    i === 0 ? "#FFD700, #FFA500" : 
                    i === 1 ? "#FFA500, #FF8C00" : 
                    "#FF8C00, #FF6B00"
                  })`,
                  boxShadow: `0 0 12px ${
                    i === 0 ? "rgba(255, 215, 0, 0.6)" : 
                    i === 1 ? "rgba(255, 165, 0, 0.6)" : 
                    "rgba(255, 140, 0, 0.6)"
                  }`,
                  animation: `bounce-dot 1s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-bubble {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          25% { 
            transform: translate(15px, -25px) scale(1.05); 
          }
          50% { 
            transform: translate(-10px, -40px) scale(1.08); 
          }
          75% { 
            transform: translate(-20px, -20px) scale(1.03); 
          }
        }
        
        @keyframes sparkle-rise {
          0% { 
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% { 
            transform: translateY(-10vh) scale(1);
            opacity: 1;
          }
          90% { 
            opacity: 0.8;
          }
          100% { 
            transform: translateY(-110vh) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes twinkle {
          0%, 100% { 
            transform: scale(0.8) rotate(0deg);
            opacity: 0.4;
          }
          50% { 
            transform: scale(1.2) rotate(15deg);
            opacity: 1;
          }
        }
        
        @keyframes sun-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes logo-bounce {
          0% { transform: translateY(30px) scale(0.9); }
          50% { transform: translateY(-10px) scale(1.02); }
          70% { transform: translateY(5px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            opacity: 0.7;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.08);
          }
        }
        
        @keyframes inner-pulse {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(0.95);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
        
        @keyframes shine-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes dot-glow {
          0%, 100% { 
            box-shadow: 0 0 8px rgba(255, 165, 0, 0.5);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 16px rgba(255, 165, 0, 0.8);
            transform: scale(1.1);
          }
        }
        
        @keyframes bounce-dot {
          0%, 100% { 
            transform: translateY(0) scale(1);
          }
          50% { 
            transform: translateY(-12px) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
