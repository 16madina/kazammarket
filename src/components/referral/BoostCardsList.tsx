import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Sparkles, Crown, Zap, Clock } from "lucide-react";
import { useReferral, BoostCard } from "@/hooks/useReferral";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import ayokaLogo from "@/assets/ayoka-logo.png";
import { useCardFlipSound } from "@/hooks/useCardFlipSound";

interface BoostCardsListProps {
  onSelectCard?: (card: BoostCard) => void;
  selectable?: boolean;
}

export const BoostCardsList = ({ onSelectCard, selectable = false }: BoostCardsListProps) => {
  const { boostCards, isLoading } = useReferral();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const { playFlipSound } = useCardFlipSound();

  const toggleFlip = (cardId: string) => {
    playFlipSound();
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[2.5/3.5] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (boostCards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <Rocket className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Pas encore de carte boost
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Parrainez 3 amis pour en obtenir une !
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-gradient-to-r from-amber-500 to-orange-500";
      case "used":
        return "bg-blue-500/80";
      case "expired":
        return "bg-gray-500/80";
      default:
        return "bg-gray-500/80";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "used":
        return "Utilisée";
      case "expired":
        return "Expirée";
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {boostCards.map((card, index) => {
        const isFlipped = flippedCards.has(card.id);
        const cardNumber = index + 1;

        return (
          <div
            key={card.id}
            className={`relative aspect-[2.5/3.5] cursor-pointer transition-transform duration-300 ${
              card.status === "available" 
                ? "hover:scale-105" 
                : "opacity-60"
            }`}
            style={{ perspective: "1000px" }}
            onClick={() => toggleFlip(card.id)}
          >
            {/* Card Container with 3D transform */}
            <div 
              className="relative w-full h-full transition-transform duration-700"
              style={{ 
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 rounded-xl overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className={`
                  relative w-full h-full
                  ${card.status === "available" 
                    ? "bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 shadow-xl" 
                    : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800"
                  }
                `}>
                  {/* Card Border/Frame */}
                  <div className="absolute inset-1 rounded-lg border-2 border-amber-400/30" />
                  
                  {/* Corner Decorations - Top Left */}
                  <div className="absolute top-2 left-2 flex flex-col items-center">
                    <span className={`text-xl font-bold ${card.status === "available" ? "text-amber-300" : "text-gray-400"}`}>
                      {cardNumber}
                    </span>
                    <Sparkles className={`h-3 w-3 ${card.status === "available" ? "text-amber-400" : "text-gray-500"}`} />
                  </div>
                  
                  {/* Corner Decorations - Bottom Right (inverted) */}
                  <div className="absolute bottom-2 right-2 flex flex-col items-center rotate-180">
                    <span className={`text-xl font-bold ${card.status === "available" ? "text-amber-300" : "text-gray-400"}`}>
                      {cardNumber}
                    </span>
                    <Sparkles className={`h-3 w-3 ${card.status === "available" ? "text-amber-400" : "text-gray-500"}`} />
                  </div>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
                    {/* Logo Container with Glow */}
                    <div className={`
                      relative p-3 rounded-full mb-2
                      ${card.status === "available" 
                        ? "bg-gradient-to-br from-amber-600/40 to-orange-700/40 shadow-lg" 
                        : "bg-gray-700/50"
                      }
                    `}>
                      {/* Glow Effect */}
                      {card.status === "available" && (
                        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                      )}
                      <img 
                        src={ayokaLogo} 
                        alt="AYOKA" 
                        className="w-12 h-12 object-contain relative z-10"
                        style={{
                          filter: card.status === "available" 
                            ? "drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))" 
                            : "grayscale(100%)"
                        }}
                      />
                    </div>
                    
                    {/* Card Title */}
                    <h4 className={`
                      text-xs font-bold uppercase tracking-wider text-center
                      ${card.status === "available" ? "text-amber-200" : "text-gray-400"}
                    `}>
                      Carte Boost
                    </h4>
                    
                    {/* Duration */}
                    <p className={`
                      text-[10px] mt-0.5
                      ${card.status === "available" ? "text-amber-300/80" : "text-gray-500"}
                    `}>
                      {card.duration_days} jours
                    </p>

                    {/* Tap hint */}
                    <p className={`
                      text-[8px] mt-2 opacity-60
                      ${card.status === "available" ? "text-amber-300" : "text-gray-500"}
                    `}>
                      Touchez pour retourner
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getStatusColor(card.status)} text-white text-[8px] px-1.5 py-0.5`}>
                      {getStatusLabel(card.status)}
                    </Badge>
                  </div>

                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="w-full h-full" style={{
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(255,255,255,0.1) 10px,
                        rgba(255,255,255,0.1) 20px
                      )`
                    }} />
                  </div>

                  {/* Shine Effect for available cards */}
                  {card.status === "available" && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer-card 3s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 rounded-xl overflow-hidden"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className={`
                  relative w-full h-full
                  ${card.status === "available" 
                    ? "bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 shadow-xl" 
                    : "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600"
                  }
                `}>
                  {/* Card Border/Frame */}
                  <div className="absolute inset-1 rounded-lg border-2 border-amber-400/30" />

                  {/* Diamond Pattern Background */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `
                        repeating-linear-gradient(45deg, transparent 0, transparent 20px, rgba(255,215,0,0.3) 20px, rgba(255,215,0,0.3) 22px),
                        repeating-linear-gradient(-45deg, transparent 0, transparent 20px, rgba(255,215,0,0.3) 20px, rgba(255,215,0,0.3) 22px)
                      `
                    }} />
                  </div>

                  {/* Center Content - Back */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                    {/* Crown Icon */}
                    <div className={`
                      p-2 rounded-full mb-3
                      ${card.status === "available" 
                        ? "bg-gradient-to-br from-amber-500/30 to-orange-600/30" 
                        : "bg-gray-700/50"
                      }
                    `}>
                      <Crown className={`h-8 w-8 ${card.status === "available" ? "text-amber-400" : "text-gray-500"}`} />
                    </div>

                    {/* Card Details */}
                    <h4 className={`
                      text-sm font-bold uppercase tracking-wider text-center mb-2
                      ${card.status === "available" ? "text-amber-200" : "text-gray-400"}
                    `}>
                      Boost #{cardNumber}
                    </h4>

                    {/* Info Box */}
                    <div className={`
                      w-full rounded-lg p-2 space-y-1
                      ${card.status === "available" 
                        ? "bg-amber-900/50 border border-amber-700/50" 
                        : "bg-gray-800/50 border border-gray-600/50"
                      }
                    `}>
                      <div className="flex items-center gap-1.5">
                        <Zap className={`h-3 w-3 ${card.status === "available" ? "text-amber-400" : "text-gray-500"}`} />
                        <span className={`text-[10px] ${card.status === "available" ? "text-amber-300" : "text-gray-400"}`}>
                          {card.duration_days} jours en top liste
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className={`h-3 w-3 ${card.status === "available" ? "text-amber-400" : "text-gray-500"}`} />
                        <span className={`text-[10px] ${card.status === "available" ? "text-amber-300/80" : "text-gray-500"}`}>
                          {card.status === "available" && (
                            <>Obtenue {formatDistanceToNow(new Date(card.earned_at), { addSuffix: true, locale: fr })}</>
                          )}
                          {card.status === "used" && card.expires_at && (
                            <>Expire {formatDistanceToNow(new Date(card.expires_at), { addSuffix: true, locale: fr })}</>
                          )}
                          {card.status === "expired" && "Expirée"}
                        </span>
                      </div>
                    </div>

                    {/* Use Button */}
                    {selectable && card.status === "available" && (
                      <Button 
                        size="sm"
                        className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectCard) {
                            onSelectCard(card);
                          }
                        }}
                      >
                        Utiliser cette carte
                      </Button>
                    )}

                    {/* Tap hint */}
                    <p className={`
                      text-[8px] mt-2 opacity-60
                      ${card.status === "available" ? "text-amber-300" : "text-gray-500"}
                    `}>
                      Touchez pour retourner
                    </p>
                  </div>

                  {/* Corner Logo - Top Left */}
                  <div className="absolute top-2 left-2">
                    <img 
                      src={ayokaLogo} 
                      alt="AYOKA" 
                      className="w-6 h-6 object-contain opacity-50"
                    />
                  </div>

                  {/* Corner Logo - Bottom Right (inverted) */}
                  <div className="absolute bottom-2 right-2 rotate-180">
                    <img 
                      src={ayokaLogo} 
                      alt="AYOKA" 
                      className="w-6 h-6 object-contain opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer-card {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
