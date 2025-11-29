import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserListingCardProps {
  listing: any;
  onUpdate: () => void;
}

export const UserListingCard = ({ listing, onUpdate }: UserListingCardProps) => {
  const navigate = useNavigate();
  const isSold = listing.status === "sold";

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Annonce supprimée");
      onUpdate();
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = isSold ? "active" : "sold";
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listing.id);

    if (error) {
      toast.error("Erreur lors de la modification");
    } else {
      toast.success(isSold ? "Annonce réactivée" : "Annonce marquée comme vendue");
      onUpdate();
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border-0 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg">
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-muted shadow-sm">
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={`${listing.title} - ${listing.categories?.name || 'produit'} ${listing.price === 0 ? 'gratuit' : `à ${listing.price} FCFA`}${listing.status === 'sold' ? ' (vendu)' : ''}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-muted-foreground/50 text-xs">Pas d'image</span>
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Badge className="bg-yellow-500 text-black font-semibold px-3 py-1">
                Vendu
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-semibold text-base line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-xl font-bold text-primary">
            {listing.price === 0 ? (
              <span className="text-green-600">Gratuit</span>
            ) : (
              `${listing.price.toLocaleString()} FCFA`
            )}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
              {listing.categories?.name}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {listing.views === 1 ? "1 vue" : `${listing.views || 0} vues`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/listing/${listing.id}`)}
            className="min-h-[44px] text-xs px-3 rounded-full transition-all hover:scale-105 active:scale-95"
            aria-label="Voir l'annonce"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button
            size="sm"
            variant={isSold ? "default" : "secondary"}
            onClick={handleToggleStatus}
            className={`min-h-[44px] text-xs px-3 rounded-full transition-all hover:scale-105 active:scale-95 ${
              isSold ? "" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            }`}
            aria-label={isSold ? "Réactiver l'annonce" : "Marquer comme vendu"}
          >
            {isSold ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <CheckCircle className="h-3 w-3" />
            )}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            className="min-h-[44px] text-xs px-3 rounded-full transition-all hover:scale-105 active:scale-95"
            aria-label="Supprimer l'annonce"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
