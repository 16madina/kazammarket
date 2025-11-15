import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  revieweeId: string;
  transactionType: "buyer" | "seller";
}

export const ReviewDialog = ({
  open,
  onOpenChange,
  listingId,
  revieweeId,
  transactionType,
}: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("reviews").insert({
        listing_id: listingId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim() || null,
        transaction_type: transactionType,
      });

      if (error) throw error;

      toast.success("Avis publié avec succès");
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la publication de l'avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laisser un avis</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Note</label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      i < (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Commentaire (optionnel)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
