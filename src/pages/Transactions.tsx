import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { ReviewDialog } from "@/components/profile/ReviewDialog";
import { 
  ArrowLeft, 
  ShoppingBag, 
  DollarSign, 
  Calendar,
  Star,
  MessageSquare,
  Package
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const Transactions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
      }
    });
  }, [navigate]);

  const { data: transactions, refetch } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listings (
            id,
            title,
            price,
            images,
            user_id
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related profiles
      const userIds = new Set<string>();
      data?.forEach((t: any) => {
        userIds.add(t.buyer_id);
        userIds.add(t.seller_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      // Check if reviews exist for each transaction
      const { data: reviews } = await supabase
        .from("reviews")
        .select("listing_id, reviewer_id")
        .eq("reviewer_id", user.id)
        .in("listing_id", data?.map((t: any) => t.listing_id) || []);

      const reviewedListings = new Set(reviews?.map(r => r.listing_id));

      return data?.map((t: any) => ({
        ...t,
        buyer: profileMap.get(t.buyer_id),
        seller: profileMap.get(t.seller_id),
        canReview: !reviewedListings.has(t.listing_id),
      })) || [];
    },
    enabled: !!user,
  });

  const handleReview = (transaction: any) => {
    setSelectedTransaction(transaction);
    setReviewDialogOpen(true);
  };

  const handleContactSeller = (sellerId: string) => {
    navigate(`/seller/${sellerId}`);
  };

  const renderTransaction = (transaction: any, index: number) => {
    const isBuyer = transaction.buyer_id === user?.id;
    const otherParty = isBuyer ? transaction.seller : transaction.buyer;

    return (
      <Card 
        key={transaction.id}
        className="animate-fade-in shadow-md border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Listing Image */}
            <div 
              className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/listing/${transaction.listing_id}`)}
            >
              <img
                src={transaction.listings?.images?.[0] || "/placeholder.svg"}
                alt={transaction.listings?.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold text-base truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/listing/${transaction.listing_id}`)}
                  >
                    {transaction.listings?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(transaction.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
                <Badge className={isBuyer ? "bg-blue-500/10 text-blue-600" : "bg-green-500/10 text-green-600"}>
                  {isBuyer ? "Achat" : "Vente"}
                </Badge>
              </div>

              {/* Other Party Info */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherParty?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {otherParty?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {isBuyer ? "Vendeur: " : "Acheteur: "}
                  <span className="font-medium text-foreground">{otherParty?.full_name || "Utilisateur"}</span>
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg">{transaction.amount} FCFA</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {transaction.canReview && (
                  <Button
                    size="sm"
                    onClick={() => handleReview(transaction)}
                    className="flex-1"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Laisser un avis
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleContactSeller(isBuyer ? transaction.seller_id : transaction.buyer_id)}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contacter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const sales = transactions?.filter((t: any) => t.seller_id === user?.id) || [];
  const purchases = transactions?.filter((t: any) => t.buyer_id === user?.id) || [];

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Mes Transactions</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {/* Stats Card */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{sales.length}</p>
                <p className="text-sm text-muted-foreground">Ventes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{purchases.length}</p>
                <p className="text-sm text-muted-foreground">Achats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">
              Toutes ({transactions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="sales">
              Ventes ({sales.length})
            </TabsTrigger>
            <TabsTrigger value="purchases">
              Achats ({purchases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {!transactions || transactions.length === 0 ? (
              <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Aucune transaction</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vos transactions apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              transactions.map((transaction, index) => renderTransaction(transaction, index))
            )}
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            {sales.length === 0 ? (
              <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Aucune vente</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vos ventes apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              sales.map((transaction, index) => renderTransaction(transaction, index))
            )}
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            {purchases.length === 0 ? (
              <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Aucun achat</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vos achats apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              purchases.map((transaction, index) => renderTransaction(transaction, index))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedTransaction && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          listingId={selectedTransaction.listing_id}
          revieweeId={
            selectedTransaction.buyer_id === user?.id
              ? selectedTransaction.seller_id
              : selectedTransaction.buyer_id
          }
          transactionType={
            selectedTransaction.buyer_id === user?.id ? "buyer" : "seller"
          }
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Transactions;
