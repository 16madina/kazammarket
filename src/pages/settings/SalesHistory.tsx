import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatPriceWithConversion } from "@/utils/currency";

const SalesHistory = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    checkAuth();
  }, []);

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-history", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listings:listing_id (
            title,
            images,
            price,
            currency
          ),
          profiles:buyer_id (
            full_name
          )
        `)
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["offers-history", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("price_offers")
        .select(`
          *,
          listings:listing_id (
            title,
            images,
            price,
            currency
          ),
          sender:sender_id (
            full_name
          )
        `)
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Complété", variant: "default" },
      pending: { label: "En attente", variant: "secondary" },
      accepted: { label: "Accepté", variant: "default" },
      rejected: { label: "Refusé", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 p-4 max-w-screen-xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Ventes et offres</h1>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sales">
              <TrendingUp className="h-4 w-4 mr-2" />
              Ventes
            </TabsTrigger>
            <TabsTrigger value="offers">
              <Package className="h-4 w-4 mr-2" />
              Offres reçues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-6">
            {salesLoading ? (
              <div className="text-center py-12 text-muted-foreground">Chargement...</div>
            ) : !sales || sales.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune vente pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sales.map((sale: any) => (
                  <Card key={sale.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {sale.listings?.images?.[0] && (
                          <img
                            src={sale.listings.images[0]}
                            alt={sale.listings.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{sale.listings?.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Acheteur: {sale.profiles?.full_name || "Inconnu"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              {formatPriceWithConversion(sale.amount, sale.listings?.currency || "FCFA", "FCFA")}
                            </span>
                            {getStatusBadge(sale.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(sale.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="offers" className="mt-6">
            {offersLoading ? (
              <div className="text-center py-12 text-muted-foreground">Chargement...</div>
            ) : !offers || offers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune offre reçue</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {offers.map((offer: any) => (
                  <Card key={offer.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {offer.listings?.images?.[0] && (
                          <img
                            src={offer.listings.images[0]}
                            alt={offer.listings.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{offer.listings?.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            De: {offer.sender?.full_name || "Inconnu"}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPriceWithConversion(offer.listings?.price || 0, offer.listings?.currency || "FCFA", "FCFA")}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              {formatPriceWithConversion(offer.amount, offer.listings?.currency || "FCFA", "FCFA")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(offer.status)}
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(offer.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesHistory;
