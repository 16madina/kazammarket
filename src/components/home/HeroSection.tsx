import { Search, Star, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ayokaMarketLogo from "@/assets/ayoka-market-final-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useHeroCarousel } from "@/hooks/useHeroCarousel";
import { useAppRating } from "@/hooks/useAppRating";
import { useReferral } from "@/hooks/useReferral";
import { useHaptics } from "@/hooks/useHaptics";
import { BoostPromoButton } from "@/components/referral/BoostPromoButton";

const HeroSection = () => {
  const {
    t
  } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    currentImage
  } = useHeroCarousel();
  const { openAppStore } = useAppRating();
  const { availableCards } = useReferral();
  const haptics = useHaptics();
  const [boostDialogOpen, setBoostDialogOpen] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Effet parallaxe au scroll
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        const heroHeight = heroRef.current.offsetHeight;

        // Calculer l'offset parallaxe (mouvement subtil)
        // Le hero bouge plus lentement que le scroll (effet parallaxe)
        const offset = Math.min(scrolled * 0.5, heroHeight * 0.3);
        setParallaxOffset(offset);
      }
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div ref={heroRef} className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Image de fond avec effet parallaxe */}
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out" style={{
      backgroundImage: `url(${currentImage})`,
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      transform: `translateY(${parallaxOffset}px)`
    }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-background" />
      </div>

      {/* Bouton Noter AYOKA - En haut à droite, compact sur mobile */}
      <button 
        onClick={openAppStore}
        className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 min-h-[32px] md:min-h-[44px] text-[10px] md:text-xs font-medium text-white bg-white/15 backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all duration-300 hover:bg-white/25 active:bg-white/30 hover:scale-105 hover:shadow-xl animate-fade-in group overflow-hidden touch-manipulation"
        style={{ animationDelay: "0.8s", WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Effet brillance animé */}
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        <Star className="h-3 w-3 md:h-3.5 md:w-3.5 text-yellow-400 fill-yellow-400 relative z-10" />
        <span className="relative z-10">Noter AYOKA</span>
      </button>

      {/* Bouton Boost - À gauche dans le hero */}
      <button
        onClick={() => {
          haptics.medium();
          setBoostDialogOpen(true);
        }}
        className="absolute left-0 top-1/3 z-10 flex items-center gap-1.5 
          bg-gradient-to-r from-primary to-primary/80 text-primary-foreground
          pl-2 pr-3 py-2.5 rounded-r-full shadow-lg
          hover:shadow-xl hover:scale-105 active:scale-95
          transition-all duration-300 group animate-boost-hero"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        <Rocket className="h-4 w-4 rotate-90 group-hover:animate-bounce" />
        <span className="text-xs font-semibold tracking-wide">Boost</span>
        {availableCards.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
            {availableCards.length}
          </span>
        )}
      </button>
      
      {/* Boost Dialog */}
      <BoostPromoButton isOpen={boostDialogOpen} onOpenChange={setBoostDialogOpen} />
      
      <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center animate-fade-in mb-4">
          <h1 className="text-2xl md:text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-0 font-serif font-extrabold">
            Bienvenue sur
          </h1>
          <img src={ayokaMarketLogo} alt="AYOKA Market" className="h-32 md:h-56 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] -mt-4 md:-mt-6" />
        </div>
        <p className="text-lg md:text-xl text-white font-semibold mb-8 max-w-2xl animate-fade-in bg-warm-earth/50 backdrop-blur-sm px-6 py-3 rounded-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{
        animationDelay: "0.2s"
      }}>
          {t('hero.subtitle')}
        </p>
        
        <div className="w-full max-w-2xl flex gap-2 animate-fade-in" style={{
        animationDelay: "0.4s"
      }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('hero.search_placeholder')} className="pl-10 h-12 bg-white text-foreground" onKeyDown={e => {
            if (e.key === "Enter" && searchQuery.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }
          }} />
          </div>
          <Button className="h-12 px-8 transition-all duration-300 hover:scale-105" onClick={() => {
          if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
          }
        }}>
            {t('hero.search_button')}
          </Button>
        </div>
      </div>
      
      {/* Boost button animation */}
      <style>{`
        @keyframes boostSlideInHero {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-boost-hero {
          animation: boostSlideInHero 0.6s ease-out 0.5s forwards;
          transform: translateX(-100%);
        }
      `}</style>
    </div>;
};
export default HeroSection;