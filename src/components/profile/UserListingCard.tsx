import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useHaptics } from "@/hooks/useHaptics";

interface UserListingCardProps {
  listing: any;
  onUpdate: () => void;
}

export const UserListingCard = ({ listing, onUpdate }: UserListingCardProps) => {
  const navigate = useNavigate();
  const isSold = listing.status === "sold";
  const haptics = useHaptics();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    haptics.heavy();
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id);

    if (error) {
      haptics.error();
      toast.error("Erreur lors de la suppression");
    } else {
      haptics.success();
      toast.success("Annonce supprimée");
      onUpdate();
    }
  };

  const handleToggleStatus = async () => {
    haptics.medium();
    const newStatus = isSold ? "active" : "sold";
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listing.id);

    if (error) {
      haptics.error();
      toast.error("Erreur lors de la modification");
    } else {
      haptics.success();
      toast.success(isSold ? "Annonce réactivée" : "Annonce marquée comme vendue");
      onUpdate();
    }
  };

  const handleCardClick = () => {
    navigate(`/listing/${listing.id}`);
  };

  return (
    <Card className="overflow-hidden shadow-md border-0 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg active:scale-[0.99]">
      <div className="flex gap-3 p-3">
        {/* Clickable zone (image + content) */}
        <div 
          className="flex gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={handleCardClick}
          role="link"
          aria-label={`Voir l'annonce ${listing.title}`}
        >
          {/* Image */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={`${listing.title} - ${listing.categories?.name || 'produit'} ${listing.price === 0 ? 'gratuit' : `à ${listing.price} FCFA`}${listing.status === 'sold' ? ' (vendu)' : ''}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-muted-foreground/50 text-[10px]">Pas d'image</span>
              </div>
            )}
            {isSold && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Badge className="bg-yellow-500 text-black font-semibold px-2 py-0.5 text-[10px]">
                  Vendu
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm line-clamp-1">
              {listing.title}
            </h3>
            <p className="text-base font-bold text-primary">
              {listing.price === 0 ? (
                <span className="text-green-600">Gratuit</span>
              ) : (
                `${listing.price.toLocaleString()} FCFA`
              )}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full">
                {listing.categories?.name}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {listing.views === 1 ? "1 vue" : `${listing.views || 0} vues`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); navigate(`/listing/${listing.id}`); }}
            className="h-9 w-9 p-0 rounded-full transition-all hover:scale-105 active:scale-95"
            aria-label="Voir l'annonce"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            size="sm"
            variant={isSold ? "default" : "secondary"}
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(); }}
            className={`h-9 w-9 p-0 rounded-full transition-all hover:scale-105 active:scale-95 ${
              isSold ? "" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            }`}
            aria-label={isSold ? "Réactiver l'annonce" : "Marquer comme vendu"}
          >
            {isSold ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="h-9 w-9 p-0 rounded-full transition-all hover:scale-105 active:scale-95"
            aria-label="Supprimer l'annonce"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
