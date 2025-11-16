import { useEffect, useState } from "react";
import djassaLogo from "@/assets/djassa-logo.png";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [stage, setStage] = useState<'logo' | 'text' | 'fadeout'>('logo');

  useEffect(() => {
    // Animation en 3 étapes
    const logoTimer = setTimeout(() => {
      setStage('text');
    }, 800);

    const textTimer = setTimeout(() => {
      setStage('fadeout');
    }, 1600);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2300);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 transition-opacity duration-700 ${
        stage === 'fadeout' ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 relative">
        {/* Logo principal avec animation de zoom */}
        <div 
          className={`relative transition-all duration-700 ${
            stage === 'logo' ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <img
            src={djassaLogo}
            alt="DJASSA Market"
            className="w-80 md:w-96 drop-shadow-2xl"
            style={{ 
              imageRendering: 'crisp-edges',
              WebkitFontSmoothing: 'antialiased'
            }}
          />
          {/* Effet de lueur */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 -z-10 animate-pulse" />
        </div>
        
        {/* Texte qui apparaît après le logo */}
        <div 
          className={`flex flex-col items-center gap-3 transition-all duration-700 ${
            stage === 'text' || stage === 'fadeout' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="flex items-baseline gap-2">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              DJASSA
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-pacifico text-primary">
            Market
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mt-2" />
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Votre marketplace de confiance
          </p>
        </div>

        {/* Indicateur de chargement */}
        {stage !== 'fadeout' && (
          <div className="flex gap-2 mt-8 absolute bottom-0">
            <div 
              className="w-2 h-2 rounded-full bg-primary animate-bounce" 
              style={{ animationDelay: "0s", animationDuration: "0.6s" }} 
            />
            <div 
              className="w-2 h-2 rounded-full bg-primary animate-bounce" 
              style={{ animationDelay: "0.2s", animationDuration: "0.6s" }} 
            />
            <div 
              className="w-2 h-2 rounded-full bg-primary animate-bounce" 
              style={{ animationDelay: "0.4s", animationDuration: "0.6s" }} 
            />
          </div>
        )}

        {/* Cercles décoratifs animés */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">
          <div 
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/5 animate-pulse"
            style={{ animationDuration: "3s" }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-accent/5 animate-pulse"
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
