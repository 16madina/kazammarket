import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfileVisibility = () => {
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState("everyone");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadVisibilitySettings(user.id);
      }
    };
    checkAuth();
  }, []);

  const loadVisibilitySettings = async (uid: string) => {
    // Pour l'instant, stockage local car pas de colonne dédiée dans profiles
    const saved = localStorage.getItem(`profile_visibility_${uid}`);
    if (saved) setVisibility(saved);
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Sauvegarder en local (en attendant l'ajout d'une colonne dans la DB)
      localStorage.setItem(`profile_visibility_${userId}`, visibility);
      
      toast.success("Paramètres de confidentialité mis à jour");
      navigate("/settings");
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
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
          <h1 className="text-xl font-semibold">Qui peut voir mon profil</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Confidentialité du profil</CardTitle>
            <CardDescription>
              Contrôlez qui peut voir votre profil et vos annonces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={visibility} onValueChange={setVisibility}>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="everyone" id="everyone" className="mt-1" />
                <Label htmlFor="everyone" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">Tout le monde</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Votre profil est visible par tous les utilisateurs
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="authenticated" id="authenticated" className="mt-1" />
                <Label htmlFor="authenticated" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Utilisateurs connectés uniquement</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seuls les utilisateurs avec un compte peuvent voir votre profil
                  </p>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="private" id="private" className="mt-1" />
                <Label htmlFor="private" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Privé</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Votre profil est masqué, seules vos annonces sont visibles
                  </p>
                </Label>
              </div>
            </RadioGroup>

            <Button onClick={handleSave} className="w-full" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileVisibility;
