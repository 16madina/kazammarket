import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Sparkles, MapPin } from "lucide-react";
import { getLocationPriority, getLocationBadgeColor } from "@/utils/geographicFiltering";
import { formatPriceWithConversion } from "@/utils/currency";

const RecommendedSheet = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from("profiles")
        .select("city, country, currency")
        .eq("id", user.id)
        .maybeSingle();
      
      return data;
    },
  });

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations", user?.id, userProfile?.city, userProfile?.country],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke("recommend-listings", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error("Error fetching recommendations:", error);
        return null;
      }

      const recs = data?.recommendations || [];

      // Filtrage post-recommandation : ne garder que les annonces du même pays
      const filteredRecs = recs.filter((listing: any) => {
        const locationInfo = getLocationPriority(
          listing.location,
          userProfile?.city || null,
          userProfile?.country || null
        );
        // Garder uniquement same-city et same-country
        return locationInfo.priority === 'same-city' || locationInfo.priority === 'same-country';
      });

      // Trier par priorité géographique
      const sortedRecs = filteredRecs.sort((a: any, b: any) => {
        const priorityA = getLocationPriority(a.location, userProfile?.city || null, userProfile?.country || null);
        const priorityB = getLocationPriority(b.location, userProfile?.city || null, userProfile?.country || null);
        
        const priorityOrder = {
          'same-city': 0,
          'same-country': 1,
          'neighboring-country': 2,
          'other': 3
        };
        
        return priorityOrder[priorityA.priority] - priorityOrder[priorityB.priority];
      });

      return sortedRecs;
    },
    enabled: !!user && open, // Ne charger que si ouvert
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Ne pas afficher le bouton si pas d'utilisateur
  if (!user) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Recommandé
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommandé pour vous
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 overflow-y-auto h-[calc(85vh-80px)] pb-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-32" />
                  <CardContent className="p-3">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !recommendations || recommendations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Aucune recommandation</p>
              <p className="text-sm mt-2">Explorez les annonces pour obtenir des recommandations personnalisées</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {recommendations.map((listing: any) => {
                const locationInfo = getLocationPriority(
                  listing.location,
                  userProfile?.city || null,
                  userProfile?.country || null
                );

                return (
                  <Card
                    key={listing.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-sm group"
                    onClick={() => {
                      navigate(`/listing/${listing.id}`);
                      setOpen(false);
                    }}
                  >
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {listing.images?.[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                          <MapPin className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Recommandé
                        </Badge>
                        {locationInfo.priority !== 'other' && (
                          <Badge 
                            variant="secondary"
                            className={`${getLocationBadgeColor(locationInfo.priority)} backdrop-blur-sm text-xs`}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {locationInfo.distance}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-tight">
                        {listing.title}
                      </h3>
                      <p className="font-bold text-primary text-base mb-1">
                        {listing.price === 0 ? (
                          <span className="text-green-600">
                            {formatPriceWithConversion(0, listing.currency || "FCFA", userProfile?.currency || "FCFA")}
                          </span>
                        ) : (
                          formatPriceWithConversion(listing.price, listing.currency || "FCFA", userProfile?.currency || "FCFA")
                        )}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-1">{listing.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecommendedSheet;
