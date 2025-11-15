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
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Pas d'image
            </div>
          )}
          {isSold && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
              Vendu
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-2xl font-bold text-primary">
            {listing.price === 0 ? (
              <span className="text-green-600">Gratuit</span>
            ) : (
              `${listing.price.toLocaleString()} FCFA`
            )}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {listing.categories?.name}
            </Badge>
            <span>{listing.views || 0} vues</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/listing/${listing.id}`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
          
          <Button
            size="sm"
            variant={isSold ? "default" : "secondary"}
            onClick={handleToggleStatus}
            className={isSold ? "" : "bg-orange-500 hover:bg-orange-600 text-white"}
          >
            {isSold ? (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Réactiver
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Vendu
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
};
