import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Gift, Rocket, Users, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useReferral, BoostCard } from "@/hooks/useReferral";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { BoostCardsList } from "@/components/referral/BoostCardsList";
import { SelectListingDialog } from "@/components/referral/SelectListingDialog";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import BottomNav from "@/components/BottomNav";

const ReferralPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BoostCard | null>(null);
  const [showSelectListing, setShowSelectListing] = useState(false);
  const {
    referralCode,
    referralCount,
    availableCards,
    usedCards,
    referrals,
    validatedReferrals,
    pendingReferrals,
    activeBoosts,
    referralsToNextCard,
    progressToNextCard,
    nextMilestoneInfo,
    isLoading,
  } = useReferral();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    });
  }, [navigate]);

  const handleShare = async () => {
    if (!referralCode) return;
    
    const shareText = `Rejoins AYOKA MARKET avec mon code parrain ${referralCode} et découvre des milliers d'annonces près de chez toi ! 🛍️✨`;
    const shareUrl = `https://ayokamarket.com?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AYOKA MARKET - Parrainage",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: "Lien copié !",
        description: "Partagez-le avec vos amis",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center gap-3 p-4 pt-safe">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Parrainage</h1>
            <p className="text-sm text-white/80">Invitez vos amis, gagnez des boosts</p>
          </div>
          <Button
            onClick={handleShare}
            className="bg-white text-amber-600 hover:bg-white/90"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Main Stats Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {isLoading ? <Skeleton className="h-8 w-20 mx-auto" /> : referralCount}
              </h2>
              <p className="text-muted-foreground">Parrainages validés</p>
            </div>

            {/* Referral Code */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-4">
              <p className="text-xs text-muted-foreground text-center mb-2">Votre code parrain</p>
              <p className="font-mono font-bold text-2xl text-center tracking-[0.3em] text-amber-700 dark:text-amber-400">
                {isLoading ? <Skeleton className="h-8 w-40 mx-auto" /> : referralCode}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Prochaine carte {nextMilestoneInfo?.tier === 'gold' ? 'Or' : nextMilestoneInfo?.tier === 'silver' ? 'Argent' : 'Bronze'}
                </span>
                <span className="font-medium">{nextMilestoneInfo?.milestone - referralsToNextCard}/{nextMilestoneInfo?.milestone}</span>
              </div>
              <Progress value={progressToNextCard} className="h-3" />
              <p className="text-xs text-center text-muted-foreground">
                {referralsToNextCard === 0 
                  ? "🎉 Nouvelle carte débloquée !" 
                  : `Plus que ${referralsToNextCard} parrainage${referralsToNextCard > 1 ? "s" : ""} (${nextMilestoneInfo?.duration} jours de boost)`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-4">
              <Rocket className="h-6 w-6 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{availableCards.length}</p>
              <p className="text-xs text-muted-foreground">Cartes dispo</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Clock className="h-6 w-6 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{pendingReferrals.length}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <CheckCircle2 className="h-6 w-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{validatedReferrals.length}</p>
              <p className="text-xs text-muted-foreground">Validés</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Cartes Boost</TabsTrigger>
            <TabsTrigger value="referrals">Filleuls</TabsTrigger>
            <TabsTrigger value="boosts">Boosts actifs</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-4">
            <BoostCardsList 
              selectable={true}
              onSelectCard={(card) => {
                setSelectedCard(card);
                setShowSelectListing(true);
              }}
            />
          </TabsContent>

          <TabsContent value="referrals" className="mt-4 space-y-3">
            {referrals.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Pas encore de filleuls</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Partagez votre code pour commencer
                  </p>
                </CardContent>
              </Card>
            ) : (
              referrals.map((referral) => (
                <Card key={referral.id}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      referral.status === "validated" ? "bg-green-100" : "bg-amber-100"
                    }`}>
                      {referral.status === "validated" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Filleul inscrit</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <Badge variant={referral.status === "validated" ? "default" : "secondary"}>
                      {referral.status === "validated" ? "Validé" : "En attente"}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="boosts" className="mt-4 space-y-3">
            {activeBoosts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Rocket className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Aucun boost actif</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilisez une carte pour booster une annonce
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeBoosts.map((boost: any) => (
                <Card key={boost.id} className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                      <Rocket className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{boost.listing?.title || "Annonce"}</p>
                      <p className="text-xs text-muted-foreground">
                        Expire {formatDistanceToNow(new Date(boost.ends_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                      Actif
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Partagez votre code</p>
                <p className="text-sm text-muted-foreground">
                  Envoyez votre code parrain à vos amis
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Ils s'inscrivent et publient</p>
                <p className="text-sm text-muted-foreground">
                  Votre parrainage est validé quand ils publient leur 1ère annonce
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Gagnez des cartes boost</p>
                <p className="text-sm text-muted-foreground">
                  Paliers progressifs avec des récompenses croissantes
                </p>
              </div>
            </div>
            
            {/* Tier Milestones */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="text-sm font-medium mb-3">Paliers de récompenses :</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center text-white text-xs">●</span>
                <span className="font-medium">3 parrainages</span>
                <span className="text-muted-foreground">→ Carte Bronze (2 jours)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs">◆</span>
                <span className="font-medium">8 parrainages</span>
                <span className="text-muted-foreground">→ Carte Argent (3 jours)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white text-xs">★</span>
                <span className="font-medium">10 parrainages</span>
                <span className="text-muted-foreground">→ Carte Or (7 jours)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white text-xs">★</span>
                <span className="font-medium">+7 ensuite</span>
                <span className="text-muted-foreground">→ Nouvelle Carte Or</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Select Listing Dialog */}
      <SelectListingDialog
        open={showSelectListing}
        onOpenChange={setShowSelectListing}
        boostCard={selectedCard}
        onSuccess={() => {
          setSelectedCard(null);
          setShowSelectListing(false);
        }}
      />

      <BottomNav />
    </div>
  );
};

export default ReferralPage;
