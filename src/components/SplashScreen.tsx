import { useEffect, useState } from "react";
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

  const duration = isShortVersion ? 500 : 3000;
  const fadeOutDuration = isShortVersion ? 300 : 800;

  useEffect(() => {
    if (!isShortVersion) {
      playStartupSound();
      haptics.medium();
      
      // Animation phases for staggered reveal
      const phase1 = setTimeout(() => setAnimationPhase(1), 200);
      const phase2 = setTimeout(() => setAnimationPhase(2), 600);
      const phase3 = setTimeout(() => setAnimationPhase(3), 1000);
      
      return () => {
        clearTimeout(phase1);
        clearTimeout(phase2);
        clearTimeout(phase3);
      };
    } else {
      haptics.light();
    }
  }, [isShortVersion, haptics, playStartupSound]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      if (!isShortVersion) {
        haptics.success();
      }
      setTimeout(() => {
        onFinish();
      }, fadeOutDuration);
    }, duration);

    return () => clearTimeout(timer);
  }, [onFinish, haptics, isShortVersion, duration, fadeOutDuration]);

  // Short version: elegant minimal splash
  if (isShortVersion) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-500 ${
          fadeOut ? "opacity-0 scale-110" : "opacity-100 scale-100"
        }`}
        style={{
          background: "linear-gradient(160deg, #1a1a1a 0%, #2d2420 50%, #1a1612 100%)",
        }}
      >
        <div className="relative">
          {/* Subtle glow */}
          <div 
            className="absolute inset-0 -m-16 rounded-full blur-3xl opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(180, 140, 100, 0.6) 0%, transparent 70%)",
            }}
          />
          <img
            src={ayokaSplashLogo}
            alt="AYOKA MARKET"
            className="w-56 md:w-72 drop-shadow-2xl object-contain relative z-10 animate-fade-in"
            style={{ 
              filter: "drop-shadow(0 0 40px rgba(180, 140, 100, 0.4))"
            }}
          />
        </div>
      </div>
    );
  }

  // Full version: premium native-like splash
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-800 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        background: "linear-gradient(160deg, #0f0f0f 0%, #1a1612 30%, #2d2420 60%, #1a1612 100%)",
      }}
    >
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 120%, rgba(180, 140, 100, 0.15) 0%, transparent 50%)",
        }}
      />

      {/* Floating orbs - subtle ambient animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large ambient orb */}
        <div 
          className={`absolute w-[500px] h-[500px] rounded-full transition-all duration-1000 ${
            animationPhase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            top: "-20%",
            right: "-15%",
            background: "radial-gradient(circle, rgba(180, 140, 100, 0.08) 0%, transparent 60%)",
            animation: "float-slow 8s ease-in-out infinite",
          }}
        />
        
        {/* Secondary orb */}
        <div 
          className={`absolute w-[400px] h-[400px] rounded-full transition-all duration-1000 delay-200 ${
            animationPhase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
          style={{
            bottom: "-15%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(139, 90, 60, 0.1) 0%, transparent 60%)",
            animation: "float-slow 10s ease-in-out infinite reverse",
          }}
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full transition-opacity duration-1000 ${
              animationPhase >= 2 ? "opacity-100" : "opacity-0"
            }`}
            style={{
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              left: `${8 + i * 7.5}%`,
              bottom: "0%",
              background: `rgba(${180 - i * 5}, ${140 - i * 3}, ${100 - i * 2}, ${0.3 + (i % 3) * 0.1})`,
              animation: `particle-float ${5 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {/* Subtle light rays */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] transition-opacity duration-1500 ${
            animationPhase >= 2 ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(180, 140, 100, 0.02) 30deg, transparent 60deg, rgba(180, 140, 100, 0.02) 90deg, transparent 120deg, rgba(180, 140, 100, 0.02) 150deg, transparent 180deg, rgba(180, 140, 100, 0.02) 210deg, transparent 240deg, rgba(180, 140, 100, 0.02) 270deg, transparent 300deg, rgba(180, 140, 100, 0.02) 330deg, transparent 360deg)",
            animation: "rotate-rays 20s linear infinite",
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-8 relative z-10">
        
        {/* Logo container with premium effects */}
        <div 
          className={`relative transition-all duration-1000 ease-out ${
            animationPhase >= 1 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-8 scale-95"
          }`}
        >
          {/* Outer glow ring */}
          <div 
            className={`absolute inset-0 -m-20 rounded-full transition-all duration-1000 delay-300 ${
              animationPhase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
            style={{
              background: "radial-gradient(circle, rgba(180, 140, 100, 0.2) 0%, rgba(180, 140, 100, 0.05) 40%, transparent 70%)",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          />

          {/* Inner pulsing glow */}
          <div 
            className="absolute inset-0 -m-8 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(circle, rgba(180, 140, 100, 0.4) 0%, transparent 60%)",
              animation: "pulse-inner 2s ease-in-out infinite",
            }}
          />

          {/* Logo with shimmer */}
          <div className="relative">
            <img
              src={ayokaSplashLogo}
              alt="AYOKA MARKET"
              className="w-72 md:w-96 object-contain relative z-10"
              style={{ 
                filter: "drop-shadow(0 0 50px rgba(180, 140, 100, 0.5)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))"
              }}
            />
            
            {/* Shimmer overlay */}
            <div
              className={`absolute inset-0 z-20 transition-opacity duration-500 ${
                animationPhase >= 2 ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.15) 45%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.15) 55%, transparent 60%)",
                backgroundSize: "250% 100%",
                animation: "shimmer-sweep 2.5s ease-in-out infinite",
                animationDelay: "0.5s",
              }}
            />
          </div>
        </div>

        {/* Tagline with elegant reveal */}
        <div 
          className={`flex flex-col items-center gap-4 transition-all duration-1000 delay-300 ${
            animationPhase >= 2 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
        >
          {/* Decorative line */}
          <div className="flex items-center gap-3">
            <div 
              className={`h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent transition-all duration-1000 ${
                animationPhase >= 3 ? "w-16" : "w-0"
              }`}
            />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-600/60" />
            <div 
              className={`h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent transition-all duration-1000 ${
                animationPhase >= 3 ? "w-16" : "w-0"
              }`}
            />
          </div>
          
          <p 
            className={`text-base md:text-lg text-white/80 text-center px-8 font-light tracking-wide transition-all duration-700 delay-200 ${
              animationPhase >= 3 ? "opacity-100" : "opacity-0"
            }`}
            style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            Donnez une seconde vie à vos articles
          </p>
        </div>

        {/* Premium loading indicator */}
        <div 
          className={`relative mt-6 transition-all duration-700 delay-500 ${
            animationPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Glowing dots loader */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: "linear-gradient(135deg, rgba(180, 140, 100, 0.9) 0%, rgba(139, 90, 60, 0.9) 100%)",
                  boxShadow: "0 0 10px rgba(180, 140, 100, 0.5)",
                  animation: `dot-bounce 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -20px) scale(1.02); }
          50% { transform: translate(-5px, -30px) scale(1.05); }
          75% { transform: translate(-15px, -15px) scale(1.02); }
        }
        
        @keyframes particle-float {
          0% { 
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes rotate-rays {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes pulse-inner {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(0.95);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes shimmer-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes dot-bounce {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
