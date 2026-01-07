import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, ArrowRight } from "lucide-react";
import { useReferral, BoostCard } from "@/hooks/useReferral";
import { useConfetti } from "@/hooks/useConfetti";
import { useHaptics } from "@/hooks/useHaptics";

interface ApplyBoostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
}

export const ApplyBoostDialog = ({
  open,
  onOpenChange,
  listingId,
  listingTitle,
}: ApplyBoostDialogProps) => {
  const { availableCards, applyBoost, isApplyingBoost } = useReferral();
  const [selectedCard, setSelectedCard] = useState<BoostCard | null>(null);
  const { launchConfetti } = useConfetti();
  const haptics = useHaptics();

  const handleApplyBoost = () => {
    if (!selectedCard) return;
    applyBoost(
      { listingId, boostCardId: selectedCard.id },
      {
        onSuccess: () => {
          // Celebration!
          launchConfetti(3000);
          haptics.success();
          
          // Close dialog after a short delay to let user see the celebration
          setTimeout(() => {
            onOpenChange(false);
            setSelectedCard(null);
          }, 500);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-amber-500" />
            Booster cette annonce
          </DialogTitle>
          <DialogDescription>
            Utilisez une carte boost pour placer "{listingTitle}" en top liste pendant 3 jours
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableCards.length === 0 ? (
            <div className="text-center py-6">
              <div className="p-4 rounded-full bg-muted inline-block mb-3">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">
                Vous n'avez pas de carte boost disponible
              </p>
              <p className="text-sm text-muted-foreground">
                Parrainez 3 amis pour en obtenir une !
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Sélectionnez une carte à utiliser :
              </p>
              
              <div className="space-y-2">
                {availableCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCard?.id === card.id
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                        : "border-transparent bg-muted/50 hover:border-amber-300"
                    }`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Carte Boost {card.duration_days} jours</p>
                        <p className="text-xs text-muted-foreground">
                          Votre annonce apparaîtra en premier
                        </p>
                      </div>
                      {selectedCard?.id === card.id && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleApplyBoost}
                disabled={!selectedCard || isApplyingBoost}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isApplyingBoost ? (
                  "Activation en cours..."
                ) : (
                  <>
                    Activer le boost
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
