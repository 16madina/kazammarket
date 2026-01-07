import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Sparkles } from "lucide-react";
import { useReferral, BoostCard } from "@/hooks/useReferral";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import ayokaLogo from "@/assets/ayoka-logo.png";

interface BoostCardsListProps {
  onSelectCard?: (card: BoostCard) => void;
  selectable?: boolean;
}

export const BoostCardsList = ({ onSelectCard, selectable = false }: BoostCardsListProps) => {
  const { boostCards, isLoading } = useReferral();

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
      {boostCards.map((card) => (
        <div
          key={card.id}
          className={`relative aspect-[2.5/3.5] cursor-pointer transition-all duration-300 ${
            card.status === "available" 
              ? "hover:scale-105 hover:-rotate-2 hover:shadow-2xl" 
              : "opacity-60 grayscale"
          } ${selectable && card.status === "available" ? "cursor-pointer" : ""}`}
          onClick={() => {
            if (selectable && card.status === "available" && onSelectCard) {
              onSelectCard(card);
            }
          }}
        >
          {/* Poker Card Design */}
          <div className={`
            relative w-full h-full rounded-xl overflow-hidden
            ${card.status === "available" 
              ? "bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 shadow-xl" 
              : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800"
            }
          `}>
            {/* Card Border/Frame */}
            <div className="absolute inset-1 rounded-lg border-2 border-amber-400/30" />
            
            {/* Corner Decorations - Top Left */}
            <div className="absolute top-2 left-2 flex flex-col items-center">
              <span className={`text-lg font-bold ${card.status === "available" ? "text-amber-300" : "text-gray-400"}`}>
                {card.duration_days}
              </span>
              <Sparkles className={`h-3 w-3 ${card.status === "available" ? "text-amber-400" : "text-gray-500"}`} />
            </div>
            
            {/* Corner Decorations - Bottom Right (inverted) */}
            <div className="absolute bottom-2 right-2 flex flex-col items-center rotate-180">
              <span className={`text-lg font-bold ${card.status === "available" ? "text-amber-300" : "text-gray-400"}`}>
                {card.duration_days}
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
            </div>

            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <Badge className={`${getStatusColor(card.status)} text-white text-[8px] px-1.5 py-0.5`}>
                {getStatusLabel(card.status)}
              </Badge>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-2 left-2 right-8">
              <p className={`text-[8px] truncate ${card.status === "available" ? "text-amber-400/60" : "text-gray-500/60"}`}>
                {card.status === "available" && (
                  <>Obtenue {formatDistanceToNow(new Date(card.earned_at), { addSuffix: true, locale: fr })}</>
                )}
                {card.status === "used" && card.expires_at && (
                  <>Expire {formatDistanceToNow(new Date(card.expires_at), { addSuffix: true, locale: fr })}</>
                )}
              </p>
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

          {/* Use Button Overlay for selectable cards */}
          {selectable && card.status === "available" && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 hover:opacity-100 transition-opacity bg-black/30 rounded-xl">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs"
              >
                Utiliser
              </Button>
            </div>
          )}
        </div>
      ))}

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
