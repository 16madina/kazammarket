import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Gift, Rocket, Users, CheckCircle2 } from "lucide-react";
import { useReferral } from "@/hooks/useReferral";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useNativeShare } from "@/hooks/useNativeShare";

export const ReferralCard = () => {
  const {
    referralCode,
    referralCount,
    availableCards,
    validatedReferrals,
    pendingReferrals,
    referralsToNextCard,
    progressToNextCard,
    isLoading,
  } = useReferral();
  const { share } = useNativeShare();

  const [isCopying, setIsCopying] = useState(false);

  const handleCopyCode = async () => {
    if (!referralCode) return;
    setIsCopying(true);
    await navigator.clipboard.writeText(referralCode);
    toast({
      title: "Code copié !",
      description: "Partagez-le avec vos amis",
    });
    setTimeout(() => setIsCopying(false), 1000);
  };

  const handleShare = async () => {
    if (!referralCode) return;
    
    await share({
      title: "AYOKA MARKET - Parrainage",
      text: `Rejoins AYOKA MARKET avec mon code parrain ${referralCode} et découvre des milliers d'annonces ! 🛍️`,
      url: `https://ayokamarket.com/open-app?ref=${referralCode}`,
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Gift className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-lg">Parrainage</CardTitle>
          </div>
          {availableCards.length > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {availableCards.length} carte{availableCards.length > 1 ? "s" : ""} disponible{availableCards.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <CardDescription>
          Parrainez 3 amis pour obtenir une carte boost gratuite
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-amber-200/50">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Votre code parrain</p>
            <p className="font-mono font-bold text-lg tracking-wider text-amber-700 dark:text-amber-400">
              {referralCode || "---"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyCode}
            className="shrink-0"
          >
            {isCopying ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={handleShare}
            className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>

        {/* Progress to next card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progression vers la prochaine carte
            </span>
            <span className="font-medium">
              {3 - referralsToNextCard}/3 parrainages
            </span>
          </div>
          <Progress value={progressToNextCard} className="h-2" />
          {referralsToNextCard < 3 && (
            <p className="text-xs text-muted-foreground">
              Plus que {referralsToNextCard} parrainage{referralsToNextCard > 1 ? "s" : ""} pour débloquer une carte boost !
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
            <Users className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{referralCount}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{validatedReferrals.length}</p>
            <p className="text-xs text-muted-foreground">Validés</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-xl">
            <Rocket className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold">{availableCards.length}</p>
            <p className="text-xs text-muted-foreground">Cartes</p>
          </div>
        </div>

        {/* Pending referrals info */}
        {pendingReferrals.length > 0 && (
          <p className="text-xs text-center text-muted-foreground bg-amber-100/50 dark:bg-amber-900/20 p-2 rounded-lg">
            💡 {pendingReferrals.length} filleul{pendingReferrals.length > 1 ? "s" : ""} en attente de première annonce
          </p>
        )}
      </CardContent>
    </Card>
  );
};
