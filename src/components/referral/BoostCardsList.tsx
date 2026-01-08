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
import { useHaptics } from "@/hooks/useHaptics";

interface BoostCardsListProps {
  onSelectCard?: (card: BoostCard) => void;
  selectable?: boolean;
}

// Card tier based on duration_days from the card itself
type CardTier = 'bronze' | 'silver' | 'gold';

const getCardTierFromDuration = (durationDays: number): CardTier => {
  if (durationDays >= 7) return 'gold';
  if (durationDays >= 3) return 'silver';
  return 'bronze';
};

const tierGradients = {
  bronze: {
    front: 'from-amber-700 via-amber-800 to-amber-900',
    back: 'from-amber-900 via-amber-800 to-amber-700',
    inactive: 'from-stone-600 via-stone-700 to-stone-800',
  },
  silver: {
    front: 'from-slate-400 via-slate-500 to-slate-600',
    back: 'from-slate-600 via-slate-500 to-slate-400',
    inactive: 'from-gray-500 via-gray-600 to-gray-700',
  },
  gold: {
    front: 'from-yellow-500 via-amber-500 to-orange-500',
    back: 'from-orange-500 via-amber-500 to-yellow-500',
    inactive: 'from-gray-500 via-gray-600 to-gray-700',
  },
};

const tierColors = {
  bronze: {
    border: 'border-amber-500/40',
    text: 'text-amber-200',
    subText: 'text-amber-300',
    accent: 'text-amber-400',
    glow: 'rgba(217, 119, 6, 0.5)',
    infoBox: 'bg-amber-900/50 border-amber-700/50',
    button: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
  },
  silver: {
    border: 'border-slate-300/50',
    text: 'text-slate-100',
    subText: 'text-slate-200',
    accent: 'text-slate-300',
    glow: 'rgba(148, 163, 184, 0.5)',
    infoBox: 'bg-slate-700/50 border-slate-500/50',
    button: 'from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600',
  },
  gold: {
    border: 'border-yellow-300/60',
    text: 'text-yellow-100',
    subText: 'text-yellow-200',
    accent: 'text-yellow-300',
    glow: 'rgba(234, 179, 8, 0.6)',
    infoBox: 'bg-yellow-800/50 border-yellow-600/50',
    button: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
  },
};

const getTierLabel = (tier: CardTier): string => {
  switch (tier) {
    case 'gold': return '★ Or';
    case 'silver': return '◆ Argent';
    case 'bronze': return '● Bronze';
  }
};

export const BoostCardsList = ({ onSelectCard, selectable = false }: BoostCardsListProps) => {
  const { boostCards, isLoading } = useReferral();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const { playFlipSound } = useCardFlipSound();
  const haptics = useHaptics();

  const toggleFlip = (cardId: string) => {
    playFlipSound();
    haptics.medium();
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

  return (
    <div className="grid grid-cols-2 gap-4">
      {boostCards.map((card, index) => {
        const isFlipped = flippedCards.has(card.id);
        const cardNumber = index + 1;
        const tier = getCardTierFromDuration(card.duration_days);
        const isActive = card.status === "available";
        const colors = tierColors[tier];
        const gradients = tierGradients[tier];

        return (
          <div
            key={card.id}
            className={`relative aspect-[2.5/3.5] cursor-pointer transition-transform duration-300 ${
              isActive ? "hover:scale-105" : "opacity-60"
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
                className="absolute inset-0 rounded-xl overflow-hidden shadow-xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className={`
                  relative w-full h-full bg-gradient-to-br
                  ${isActive ? gradients.front : gradients.inactive}
                `}>
                  {/* Card Border/Frame */}
                  <div className={`absolute inset-1 rounded-lg border-2 ${isActive ? colors.border : 'border-gray-500/30'}`} />
                  
                  {/* Tier Badge - Top Left */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`
                      text-[8px] px-1.5 py-0.5 font-bold
                      ${tier === 'gold' && isActive ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900' : ''}
                      ${tier === 'silver' && isActive ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800' : ''}
                      ${tier === 'bronze' && isActive ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-100' : ''}
                      ${!isActive ? 'bg-gray-500 text-gray-300' : ''}
                    `}>
                      {getTierLabel(tier)}
                    </Badge>
                  </div>
                  
                  {/* Corner Number - Top Right */}
                  <div className="absolute top-2 right-2 flex flex-col items-center">
                    <span className={`text-xl font-bold ${isActive ? colors.text : 'text-gray-400'}`}>
                      {cardNumber}
                    </span>
                    <Sparkles className={`h-3 w-3 ${isActive ? colors.accent : 'text-gray-500'}`} />
                  </div>
                  
                  {/* Corner Number - Bottom Left (inverted) */}
                  <div className="absolute bottom-2 left-2 flex flex-col items-center rotate-180">
                    <span className={`text-xl font-bold ${isActive ? colors.text : 'text-gray-400'}`}>
                      {cardNumber}
                    </span>
                    <Sparkles className={`h-3 w-3 ${isActive ? colors.accent : 'text-gray-500'}`} />
                  </div>

                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
                    {/* Logo Container with Glow */}
                    <div className={`
                      relative p-3 rounded-full mb-2
                      ${isActive ? 'shadow-lg' : 'bg-gray-700/50'}
                    `}
                    style={isActive ? {
                      background: `linear-gradient(135deg, ${colors.glow}, transparent)`
                    } : {}}
                    >
                      {/* Glow Effect */}
                      {isActive && (
                        <div 
                          className="absolute inset-0 rounded-full blur-xl animate-pulse"
                          style={{ backgroundColor: colors.glow }}
                        />
                      )}
                      <img 
                        src={ayokaLogo} 
                        alt="AYOKA" 
                        className="w-12 h-12 object-contain relative z-10"
                        style={{
                          filter: isActive 
                            ? `drop-shadow(0 0 10px ${colors.glow})` 
                            : "grayscale(100%)"
                        }}
                      />
                    </div>
                    
                    {/* Card Title */}
                    <h4 className={`
                      text-xs font-bold uppercase tracking-wider text-center
                      ${isActive ? colors.text : 'text-gray-400'}
                    `}>
                      Carte Boost
                    </h4>
                    
                    {/* Duration */}
                    <p className={`
                      text-[10px] mt-0.5
                      ${isActive ? colors.subText + '/80' : 'text-gray-500'}
                    `}>
                      {card.duration_days} jours
                    </p>

                    {/* Tap hint */}
                    <p className={`
                      text-[8px] mt-2 opacity-60
                      ${isActive ? colors.subText : 'text-gray-500'}
                    `}>
                      Touchez pour retourner
                    </p>
                  </div>

                  {/* Status Badge - Bottom Right */}
                  <div className="absolute bottom-2 right-2">
                    <Badge className={`
                      text-white text-[8px] px-1.5 py-0.5
                      ${card.status === 'available' ? 'bg-green-500/80' : ''}
                      ${card.status === 'used' ? 'bg-blue-500/80' : ''}
                      ${card.status === 'expired' ? 'bg-gray-500/80' : ''}
                    `}>
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
                  {isActive && (
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
                className="absolute inset-0 rounded-xl overflow-hidden shadow-xl"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className={`
                  relative w-full h-full bg-gradient-to-br
                  ${isActive ? gradients.back : gradients.inactive}
                `}>
                  {/* Card Border/Frame */}
                  <div className={`absolute inset-1 rounded-lg border-2 ${isActive ? colors.border : 'border-gray-500/30'}`} />

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
                      ${isActive ? '' : 'bg-gray-700/50'}
                    `}
                    style={isActive ? {
                      background: `linear-gradient(135deg, ${colors.glow}, transparent)`
                    } : {}}
                    >
                      <Crown className={`h-8 w-8 ${isActive ? colors.accent : 'text-gray-500'}`} />
                    </div>

                    {/* Card Details */}
                    <h4 className={`
                      text-sm font-bold uppercase tracking-wider text-center mb-2
                      ${isActive ? colors.text : 'text-gray-400'}
                    `}>
                      Boost #{cardNumber}
                    </h4>

                    {/* Info Box */}
                    <div className={`
                      w-full rounded-lg p-2 space-y-1 border
                      ${isActive ? colors.infoBox : 'bg-gray-800/50 border-gray-600/50'}
                    `}>
                      <div className="flex items-center gap-1.5">
                        <Zap className={`h-3 w-3 ${isActive ? colors.accent : 'text-gray-500'}`} />
                        <span className={`text-[10px] ${isActive ? colors.subText : 'text-gray-400'}`}>
                          {card.duration_days} jours en top liste
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className={`h-3 w-3 ${isActive ? colors.accent : 'text-gray-500'}`} />
                        <span className={`text-[10px] ${isActive ? colors.subText + '/80' : 'text-gray-500'}`}>
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
                    {selectable && isActive && (
                      <Button 
                        size="sm"
                        className={`mt-3 bg-gradient-to-r ${colors.button} text-xs w-full text-white`}
                        onClick={(e) => {
                          e.stopPropagation();
                          haptics.success();
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
                      ${isActive ? colors.subText : 'text-gray-500'}
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
