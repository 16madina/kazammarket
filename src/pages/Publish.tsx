import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/listing/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";

const Publish = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    location: "",
    condition: "new",
    images: [] as string[],
    isFree: false,
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        throw new Error("Non authentifié");
      }
      return user;
    },
  });

  // Fetch user profile to get country and city
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("country, city")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Auto-fill location when profile is loaded
  useEffect(() => {
    if (profile && profile.city && profile.country && !formData.location) {
      setFormData(prev => ({
        ...prev,
        location: `${profile.city}, ${profile.country}`
      }));
    }
  }, [profile]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour publier",
        variant: "destructive",
      });
      return;
    }

    if (formData.images.length === 0) {
      toast({
        title: "Images requises",
        description: "Ajoutez au moins une photo de votre article",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: formData.isFree ? 0 : parseFloat(formData.price),
        category_id: formData.category_id,
        location: formData.location,
        condition: formData.condition,
        images: formData.images,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Annonce publiée !",
        description: "Votre annonce est maintenant en ligne",
      });

      navigate("/");
    } catch (error) {
      console.error("Publish error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de publier l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-muted/30">
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Publier une annonce</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="images">Photos *</Label>
                <ImageUploader
                  images={formData.images}
                  onImagesChange={(images) =>
                    setFormData({ ...formData, images })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ex: iPhone 13 Pro Max 256GB"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez votre article en détail..."
                  required
                  rows={5}
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prix (FCFA) {!formData.isFree && "*"}</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.isFree ? "0" : formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="50000"
                    required={!formData.isFree}
                    min="0"
                    step="1000"
                    disabled={formData.isFree}
                    className={formData.isFree ? "bg-muted" : ""}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFree: checked as boolean, price: checked ? "0" : "" })
                  }
                />
                <Label htmlFor="isFree" className="cursor-pointer font-normal">
                  Article gratuit / À donner
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Ex: Dakar, Sénégal"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">État *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      setFormData({ ...formData, condition: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neuf</SelectItem>
                      <SelectItem value="like_new">Comme neuf</SelectItem>
                      <SelectItem value="good">Bon état</SelectItem>
                      <SelectItem value="fair">État moyen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Publication..." : "Publier l'annonce"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Publish;
