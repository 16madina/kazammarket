import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TwoFactor = () => {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Vérifier si 2FA est activé
        const factors = await supabase.auth.mfa.listFactors();
        setIsEnabled(factors.data && factors.data.totp && factors.data.totp.length > 0);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut 2FA:", error);
    }
  };

  const handleToggle2FA = async () => {
    setIsLoading(true);
    try {
      if (isEnabled) {
        // Désactiver 2FA
        toast.info("Fonctionnalité de désactivation à venir");
      } else {
        // Activer 2FA
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp'
        });

        if (error) throw error;

        toast.success("Authentification à deux facteurs activée");
        setIsEnabled(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la configuration");
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-xl font-semibold">Authentification à deux facteurs</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Sécurité renforcée</CardTitle>
                <CardDescription>
                  Protégez votre compte avec une couche de sécurité supplémentaire
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire en demandant un code de vérification à chaque connexion.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="2fa-toggle" className="text-base font-medium">
                  Activer l'authentification à deux facteurs
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isEnabled ? "Activé" : "Désactivé"}
                </p>
              </div>
              <Switch
                id="2fa-toggle"
                checked={isEnabled}
                onCheckedChange={handleToggle2FA}
                disabled={isLoading}
              />
            </div>

            {isEnabled && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Méthodes configurées :</p>
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="h-4 w-4" />
                  <span>Application d'authentification</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwoFactor;
