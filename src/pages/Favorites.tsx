import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Heart } from "lucide-react";

const Favorites = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          listing_id,
          listings (
            id,
            title,
            price,
            images,
            location,
            status,
            categories (name)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleRemoveFavorite = async (favoriteId: string) => {
    await supabase.from("favorites").delete().eq("id", favoriteId);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Mes Favoris</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((fav: any) => {
              const listing = fav.listings;
              if (!listing) return null;

              return (
                <Card key={fav.id} className="overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <img
                      src={listing.images?.[0] || "/placeholder.svg"}
                      alt={listing.title}
                      className="w-24 h-24 object-cover rounded-md"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    />
                    <CardContent className="flex-1 p-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 
                          className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/listing/${listing.id}`)}
                        >
                          {listing.title}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleRemoveFavorite(fav.id)}
                        >
                          <Heart className="h-5 w-5 fill-current" />
                        </Button>
                      </div>
                      <p className="text-lg font-bold text-primary mb-1">
                        {listing.price.toLocaleString()} FCFA
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {listing.categories?.name}
                        </Badge>
                        <span>{listing.location}</span>
                      </div>
                      {listing.status !== "active" && (
                        <Badge variant="outline" className="mt-2">
                          {listing.status === "sold" ? "Vendu" : "Inactif"}
                        </Badge>
                      )}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun favori pour le moment</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Favorites;
