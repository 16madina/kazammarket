import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, ArrowRight, Package, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useReferral, BoostCard } from "@/hooks/useReferral";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice } from "@/utils/currency";
import { useConfetti } from "@/hooks/useConfetti";
import { useHaptics } from "@/hooks/useHaptics";

interface SelectListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boostCard: BoostCard | null;
  onSuccess?: () => void;
}

export const SelectListingDialog = ({
  open,
  onOpenChange,
  boostCard,
  onSuccess,
}: SelectListingDialogProps) => {
  const { applyBoost, isApplyingBoost, activeBoosts } = useReferral();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { launchConfetti } = useConfetti();
  const haptics = useHaptics();

  // Fetch user's active listings
  const { data: listings, isLoading: isLoadingListings } = useQuery({
    queryKey: ["user-listings-for-boost"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, currency, images, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Get already boosted listing IDs
  const boostedListingIds = activeBoosts.map((boost: any) => boost.listing_id);

  // Filter out already boosted listings
  const availableListings = listings?.filter(
    (listing) => !boostedListingIds.includes(listing.id)
  ) || [];

  const handleApplyBoost = () => {
    if (!selectedListingId || !boostCard) return;
    
    applyBoost(
      { listingId: selectedListingId, boostCardId: boostCard.id },
      {
        onSuccess: () => {
          // Celebration!
          launchConfetti(3000);
          haptics.success();
          
          // Close dialog after a short delay
          setTimeout(() => {
            setSelectedListingId(null);
            onSuccess?.();
          }, 500);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-amber-500" />
            Choisir une annonce à booster
          </DialogTitle>
          <DialogDescription>
            Sélectionnez l'annonce que vous souhaitez placer en top liste pendant {boostCard?.duration_days || 3} jours
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-3 py-4">
            {isLoadingListings ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </>
            ) : availableListings.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-muted inline-block mb-3">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">
                  {listings?.length === 0 
                    ? "Vous n'avez pas d'annonce active"
                    : "Toutes vos annonces sont déjà boostées"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {listings?.length === 0 
                    ? "Publiez une annonce pour pouvoir la booster"
                    : "Attendez la fin des boosts actuels"}
                </p>
              </div>
            ) : (
              availableListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedListingId === listing.id
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                      : "border-transparent bg-muted/50 hover:border-amber-300"
                  }`}
                  onClick={() => setSelectedListingId(listing.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{listing.title}</p>
                      <p className="text-sm text-amber-600 font-semibold">
                        {formatPrice(listing.price, listing.currency || "FCFA")}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    {selectedListingId === listing.id && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {availableListings.length > 0 && (
          <Button
            onClick={handleApplyBoost}
            disabled={!selectedListingId || isApplyingBoost}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isApplyingBoost ? (
              "Activation en cours..."
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Booster cette annonce
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
