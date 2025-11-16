import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";
import { UserListingCard } from "@/components/profile/UserListingCard";
import { ReviewCard } from "@/components/profile/ReviewCard";
import { toast } from "sonner";
import { LogOut, Edit, Settings, Shield, Bell, Share2, ArrowLeft, Users, Star, MapPin, Calendar, Package, TrendingUp, Award, Heart, Receipt, CheckCircle2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roles);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        // Check admin status on auth state change
        setTimeout(async () => {
          if (session?.user) {
            const { data: roles } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "admin")
              .maybeSingle();
            setIsAdmin(!!roles);
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: listings, refetch: refetchListings } = useQuery({
    queryKey: ["user-listings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          categories (name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: reviews } = useQuery({
    queryKey: ["user-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("reviewee_id", user.id)
        .order("created_at", { ascending: false });
      
      if (reviewsError) throw reviewsError;
      if (!reviewsData || reviewsData.length === 0) return [];

      // Fetch reviewer profiles
      const reviewerIds = reviewsData.map(r => r.reviewer_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", reviewerIds);
      
      if (profilesError) throw profilesError;

      // Merge data
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      return reviewsData.map(review => ({
        ...review,
        reviewer: profilesMap.get(review.reviewer_id) || { full_name: null, avatar_url: null }
      }));
    },
    enabled: !!user,
  });

  const { data: following } = useQuery({
    queryKey: ["user-following", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: followersData, error: followersError } = await supabase
        .from("followers")
        .select("followed_id")
        .eq("follower_id", user.id);
      
      if (followersError) throw followersError;
      if (!followersData || followersData.length === 0) return [];

      const followedIds = followersData.map(f => f.followed_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, rating_average, rating_count, total_sales")
        .in("id", followedIds);
      
      if (profilesError) throw profilesError;
      return profilesData || [];
    },
    enabled: !!user,
  });

  const { data: favorites } = useQuery({
    queryKey: ["user-favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select(`
          *,
          listings (
            *,
            categories (name)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["user-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listings (
            title,
            images,
            categories (name)
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const activeListings = listings?.filter(l => l.status === "active") || [];
  const soldListings = listings?.filter(l => l.status === "sold") || [];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      toast.success("Déconnexion réussie");
      navigate("/auth");
    }
  };

  const fullName = profile?.full_name || user?.user_metadata?.full_name || "Utilisateur";
  const avatarUrl = profile?.avatar_url;
  
  const memberSince = profile?.created_at ? new Date(profile.created_at) : null;
  const monthsSinceMember = memberSince ? Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;
  
  // Calculate badges
  const badges = [];
  if (profile?.verified_seller) badges.push({ icon: CheckCircle2, label: "Vendeur vérifié", color: "text-blue-500" });
  if ((profile?.total_sales || 0) >= 10) badges.push({ icon: Award, label: "Vendeur expert", color: "text-yellow-500" });
  if ((profile?.rating_average || 0) >= 4.5 && (profile?.rating_count || 0) >= 5) badges.push({ icon: Star, label: "Excellent vendeur", color: "text-orange-500" });
  if (monthsSinceMember >= 12) badges.push({ icon: Calendar, label: "Membre fidèle", color: "text-purple-500" });

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <span className="font-bold text-xl">ReVivo</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6 space-y-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground">
                {fullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold">{fullName}</h1>
              {profile?.verified_seller && (
                <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-500" />
              )}
            </div>
            <p className="text-muted-foreground">{user?.email}</p>
            {(profile?.city || profile?.country) && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {profile.city && profile.country 
                    ? `${profile.city}, ${profile.country}`
                    : profile.city || profile.country}
                </span>
              </div>
            )}
            {memberSince && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Membre depuis {memberSince.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <Card className="p-4">
              <CardContent className="p-0 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Package className="h-5 w-5 text-primary" />
                  <p className="text-2xl font-bold">{activeListings.length}</p>
                  <p className="text-xs text-muted-foreground">Actives</p>
                </div>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardContent className="p-0 text-center">
                <div className="flex flex-col items-center gap-1">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <p className="text-2xl font-bold">{profile?.total_sales || 0}</p>
                  <p className="text-xs text-muted-foreground">Vendues</p>
                </div>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardContent className="p-0 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <p className="text-2xl font-bold">{profile?.rating_average?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-muted-foreground">Note</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 w-full max-w-md">
              {badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs">
                  <badge.icon className={`h-3 w-3 ${badge.color}`} />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="w-full max-w-md space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/edit-profile")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>

            {isAdmin && (
              <Button 
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white"
                onClick={() => navigate("/admin")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Panneau d'administration
              </Button>
            )}

            <Button
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-4 bg-muted/50 p-1 h-12">
            <TabsTrigger 
              value="listings"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold text-xs"
            >
              <Package className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="favorites"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold text-xs"
            >
              <Heart className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="transactions"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold text-xs"
            >
              <Receipt className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold text-xs"
            >
              <Star className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger 
              value="following"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold text-xs"
            >
              <Users className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {!listings || listings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Aucune annonce</p>
                <p className="text-sm mt-2">Commencez à publier vos articles !</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/publish")}
                >
                  Publier une annonce
                </Button>
              </div>
            ) : (
              <>
                {activeListings.map((listing) => (
                  <UserListingCard
                    key={listing.id}
                    listing={listing}
                    onUpdate={refetchListings}
                  />
                ))}
                {soldListings.map((listing) => (
                  <UserListingCard
                    key={listing.id}
                    listing={listing}
                    onUpdate={refetchListings}
                  />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {!favorites || favorites.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucun favori</p>
                <p className="text-sm mt-2">Ajoutez des annonces à vos favoris pour les retrouver facilement</p>
              </div>
            ) : (
              favorites.map((favorite: any) => (
                <Card 
                  key={favorite.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/listing/${favorite.listing_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {favorite.listings?.images?.[0] ? (
                          <img 
                            src={favorite.listings.images[0]} 
                            alt={favorite.listings.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{favorite.listings?.title}</h3>
                        <p className="text-sm text-muted-foreground">{favorite.listings?.categories?.name}</p>
                        <p className="text-lg font-bold text-primary mt-1">
                          {favorite.listings?.price.toLocaleString()} {favorite.listings?.currency || 'FCFA'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucune transaction</p>
                <p className="text-sm mt-2">Votre historique de transactions apparaîtra ici</p>
              </div>
            ) : (
              transactions.map((transaction: any) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {transaction.listings?.images?.[0] ? (
                          <img 
                            src={transaction.listings.images[0]} 
                            alt={transaction.listings.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{transaction.listings?.title}</h3>
                          {transaction.buyer_id === user?.id ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Achat</span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Vente</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{transaction.listings?.categories?.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-lg font-bold text-primary">
                            {transaction.amount.toLocaleString()} FCFA
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {transaction.status === 'completed' ? 'Complétée' : 'En cours'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {!reviews || reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucun avis</p>
                <p className="text-sm mt-2">Les avis de vos acheteurs apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{profile?.rating_average?.toFixed(1) || '0.0'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(profile?.rating_average || 0)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{profile?.rating_count || 0} avis</p>
                    </div>
                  </div>
                </div>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {!following || following.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Aucun abonnement</p>
                <p className="text-sm mt-2">Suivez vos vendeurs préférés pour voir leurs nouvelles annonces</p>
              </div>
            ) : (
              following.map((seller: any) => (
                <Card 
                  key={seller.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    // Navigate to seller's listings or profile
                    navigate(`/search?seller=${seller.id}`);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={seller.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {seller.full_name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{seller.full_name || "Utilisateur"}</h3>
                        
                        <div className="flex items-center gap-4 mt-1">
                          {seller.rating_average > 0 && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{seller.rating_average.toFixed(1)}</span>
                              <span className="text-xs">({seller.rating_count})</span>
                            </div>
                          )}
                          
                          {seller.total_sales > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {seller.total_sales} vente{seller.total_sales > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
