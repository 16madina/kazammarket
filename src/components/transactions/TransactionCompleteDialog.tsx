import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReviewDialog } from "@/components/profile/ReviewDialog";

interface TransactionCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  sellerId: string;
  buyerId: string;
  price: number;
  onSuccess?: () => void;
}

export const TransactionCompleteDialog = ({
  open,
  onOpenChange,
  listingId,
  sellerId,
  buyerId,
  price,
  onSuccess,
}: TransactionCompleteDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [revieweeId, setRevieweeId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<"buyer" | "seller">("buyer");
  const [transactionCreated, setTransactionCreated] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Create transaction
      const { error } = await supabase.from("transactions").insert({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount: price,
        status: "completed",
      });

      if (error) throw error;

      setTransactionCreated(true);
      toast.success("Transaction marquée comme complétée");

      // Determine who to review (the other party)
      if (user.id === buyerId) {
        setRevieweeId(sellerId);
        setTransactionType("buyer");
      } else {
        setRevieweeId(buyerId);
        setTransactionType("seller");
      }

      onOpenChange(false);
      
      // Show review dialog after a short delay
      setTimeout(() => {
        setShowReviewDialog(true);
      }, 300);
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la complétion de la transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Marquer la transaction comme complétée
            </DialogTitle>
            <DialogDescription>
              Confirmez que cette transaction s'est bien déroulée. Vous pourrez ensuite laisser un avis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Montant</span>
                <span className="font-semibold text-lg">{price} FCFA</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                En marquant cette transaction comme complétée, vous confirmez avoir reçu/envoyé l'article et que tout s'est bien passé.
              </div>
            </div>

            <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-700 mb-1">
                    Laissez un avis après la transaction
                  </p>
                  <p className="text-yellow-600/80 text-xs">
                    Votre avis aide la communauté à identifier les vendeurs/acheteurs fiables.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Confirmation..." : "Confirmer la transaction"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        listingId={listingId}
        revieweeId={revieweeId}
        transactionType={transactionType}
      />
    </>
  );
};
