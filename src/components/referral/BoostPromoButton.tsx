import { useState } from "react";
import { Rocket, X, Share2, Users, Gift, Sparkles, Crown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReferral } from "@/hooks/useReferral";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ayokaLogo from "@/assets/ayoka-logo.png";
import { useHaptics } from "@/hooks/useHaptics";

interface BoostPromoButtonProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const BoostPromoButton = ({ isOpen: controlledIsOpen, onOpenChange }: BoostPromoButtonProps = {}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  
  const [copied, setCopied] = useState(false);
  const { referralCode, referralCount, availableCards } = useReferral();
  const navigate = useNavigate();
  const haptics = useHaptics();

  const handleShare = async () => {
    const shareUrl = `https://ayokamarket.com/open-app?ref=${referralCode}`;
    const shareText = `🎁 Rejoins AYOKA Market avec mon code ${referralCode} et obtiens des récompenses ! Télécharge l'app ici : ${shareUrl}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Rejoins AYOKA Market !",
          text: shareText,
          url: shareUrl,
        });
        haptics.success();
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Message copié !");
        haptics.medium();
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        await navigator.clipboard.writeText(shareText);
        toast.success("Message copié !");
      }
    }
  };

  const handleCopyCode = async () => {
    if (referralCode) {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      haptics.light();
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tiers = [
    { 
      count: 3, 
      tier: "Bronze", 
      days: 2, 
      color: "from-amber-600 to-amber-800",
      textColor: "text-amber-200",
      borderColor: "border-amber-500/50",
      icon: "●"
    },
    { 
      count: 8, 
      tier: "Argent", 
      days: 3, 
      color: "from-slate-400 to-slate-600",
      textColor: "text-slate-100",
      borderColor: "border-slate-400/50",
      icon: "◆"
    },
    { 
      count: 10, 
      tier: "Or", 
      days: 7, 
      color: "from-yellow-500 to-amber-600",
      textColor: "text-yellow-100",
      borderColor: "border-yellow-400/50",
      icon: "★"
    },
  ];

  return (
    <>
      {/* Promo Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 pb-8 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Rocket className="h-6 w-6" />
                Programme Parrainage
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm opacity-90 mt-2">
              Invitez vos amis et obtenez des cartes Boost gratuites pour propulser vos annonces en tête de liste !
            </p>
            
            {/* Stats */}
            <div className="flex gap-4 mt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{referralCount}</div>
                <div className="text-xs opacity-80">Parrainages</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <div className="text-2xl font-bold">{availableCards.length}</div>
                <div className="text-xs opacity-80">Cartes dispo</div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* 3 Tier Cards Preview */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Les 3 paliers de récompenses
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {tiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className={`relative aspect-[2.5/3.5] rounded-lg overflow-hidden bg-gradient-to-br ${tier.color} border ${tier.borderColor} shadow-md`}
                  >
                    {/* Shine effect */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                      }}
                    />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                      <span className={`text-lg ${tier.textColor}`}>{tier.icon}</span>
                      <img src={ayokaLogo} alt="AYOKA" className="w-8 h-8 my-1 drop-shadow-lg" />
                      <span className={`text-[10px] font-bold ${tier.textColor}`}>{tier.tier}</span>
                      <span className={`text-[9px] ${tier.textColor} opacity-80`}>{tier.days}j boost</span>
                    </div>
                    
                    {/* Milestone badge */}
                    <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                      <span className="bg-black/40 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                        {tier.count} amis
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Comment ça marche ?
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Partagez</span> votre code de parrainage avec vos amis
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Ils s'inscrivent</span> avec votre code et publient une annonce
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Recevez</span> une carte Boost gratuite selon le palier atteint
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Code Section */}
            {referralCode && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Votre code de parrainage
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background border rounded-lg px-4 py-2.5 font-mono text-lg font-bold tracking-wider text-center">
                    {referralCode}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    className="shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
                className="flex-1 gap-2"
              >
                <Share2 className="h-4 w-4" />
                Partager mon code
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/referral");
                }}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Voir tout
              </Button>
            </div>

            {/* Bottom note */}
            <p className="text-[10px] text-muted-foreground text-center">
              Après 10 parrainages, chaque +7 amis = 1 nouvelle carte Or 🏆
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Export the trigger button separately for use in HeroSection
export const BoostPromoTrigger = ({ onClick, availableCardsCount }: { onClick: () => void; availableCardsCount: number }) => {
  const haptics = useHaptics();
  
  return (
    <button
      onClick={() => {
        haptics.medium();
        onClick();
      }}
      className="absolute left-0 top-1/3 z-10 flex items-center gap-1.5 
        bg-gradient-to-r from-primary to-primary/80 text-primary-foreground
        pl-2 pr-3 py-2.5 rounded-r-full shadow-lg
        hover:shadow-xl hover:scale-105 active:scale-95
        transition-all duration-300 group animate-boost-button"
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}
    >
      <Rocket className="h-4 w-4 rotate-90 group-hover:animate-bounce" />
      <span className="text-xs font-semibold tracking-wide">Boost</span>
      {availableCardsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
          {availableCardsCount}
        </span>
      )}
      
      <style>{`
        @keyframes boostSlideIn {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-boost-button {
          animation: boostSlideIn 0.6s ease-out 0.5s forwards;
          transform: translateX(-100%);
        }
      `}</style>
    </button>
  );
};
