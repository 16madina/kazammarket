import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Trash2, MapPin } from "lucide-react";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { CountrySelect } from "@/components/account/CountrySelect";
import { PhoneInput } from "@/components/account/PhoneInput";
import { Country } from "@/data/westAfricaData";

const AccountManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    city: "",
    country: "",
  });

  // Fonction pour détecter la localisation GPS
  const detectLocation = async () => {
    if (!('geolocation' in navigator)) {
      toast.error("Géolocalisation non disponible", {
        description: "Votre navigateur ne supporte pas la géolocalisation"
      });
      return;
    }

    toast.info("Détection en cours...", {
      description: "Veuillez autoriser l'accès à votre localisation"
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          
          const detectedCity = data.address?.city || data.address?.town || data.address?.village || "";
          const detectedCountry = data.address?.country || "";
          
          if (detectedCity || detectedCountry) {
            setFormData(prev => ({
              ...prev,
              city: detectedCity,
              country: detectedCountry,
            }));
            toast.success("Localisation détectée !", {
              description: `${detectedCity}${detectedCity && detectedCountry ? ', ' : ''}${detectedCountry}`
            });
          }
        } catch (error) {
          console.error('Error fetching location details:', error);
          toast.error("Erreur de détection");
        }
      },
      () => {
        toast.error("Permission refusée");
      }
    );
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("phone, city, country")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading user data:", error);
        toast.error("Impossible de charger. Vérifiez votre connexion.", {
          action: {
            label: "Réessayer",
            onClick: loadUserData,
          },
        });
        return;
      }

      setFormData({
        email: user.email || "",
        phone: profile?.phone || "",
        city: profile?.city || "",
        country: profile?.country || "",
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Impossible de charger. Vérifiez votre connexion.", {
        action: {
          label: "Réessayer",
          onClick: loadUserData,
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) {
          toast.error("Impossible de mettre à jour l'email. Vérifiez votre connexion.", {
            action: {
              label: "Réessayer",
              onClick: () => handleSubmit(e),
            },
          });
          return;
        }
        toast.success("Un email de confirmation a été envoyé à votre nouvelle adresse");
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone: formData.phone,
          city: formData.city,
          country: formData.country,
        })
        .eq("id", user.id);

      if (profileError) {
        toast.error("Impossible de sauvegarder. Vérifiez votre connexion.", {
          action: {
            label: "Réessayer",
            onClick: () => handleSubmit(e),
          },
        });
        return;
      }

      toast.success("Informations mises à jour avec succès");
    } catch (error: any) {
      console.error("Error updating user data:", error);
      toast.error("Impossible de sauvegarder. Vérifiez votre connexion.", {
        action: {
          label: "Réessayer",
          onClick: () => handleSubmit(e),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10 pt-safe">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Gérer mon compte</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  Un email de confirmation sera envoyé si vous changez votre adresse
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="6 12 34 56 78"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Pays</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={detectLocation}
                    disabled={loading}
                    className="h-8 gap-2 text-xs"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Détecter ma position</span>
                  </Button>
                </div>
                <CountrySelect
                  value={formData.country}
                  onChange={(country: Country) => {
                    setFormData({
                      ...formData,
                      country: country.name,
                    });
                  }}
                  placeholder="Sélectionner votre pays"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Abidjan"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Cette localisation est utilisée pour afficher les annonces proches de vous en priorité
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </form>
        </Card>

        {/* Delete Account Section */}
        <Card className="p-6 border-destructive/20">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-destructive">Zone de danger</h3>
              <p className="text-sm text-muted-foreground mt-1">
                La suppression de votre compte est définitive et irréversible
              </p>
            </div>
            
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </Button>
          </div>
        </Card>
      </div>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
};

export default AccountManagement;
