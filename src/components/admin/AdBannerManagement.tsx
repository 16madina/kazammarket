import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, ExternalLink } from "lucide-react";

interface AdBanner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdBannerManagement() {
  const queryClient = useQueryClient();
  const [newBanner, setNewBanner] = useState({
    title: "",
    image_url: "",
    link_url: "",
    display_order: 0,
  });

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["ad-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_banners")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data as AdBanner[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (banner: typeof newBanner) => {
      const { error } = await supabase
        .from("ad_banners")
        .insert([banner]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-banners"] });
      toast.success("Bannière créée avec succès");
      setNewBanner({ title: "", image_url: "", link_url: "", display_order: 0 });
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  const updateBanner = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("ad_banners")
        .update({ active })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-banners"] });
      toast.success("Bannière mise à jour");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const deleteBanner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ad_banners")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-banners"] });
      toast.success("Bannière supprimée");
    },
    onError: (error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `ad-banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listings")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur lors de l'upload: " + uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("listings")
      .getPublicUrl(filePath);

    setNewBanner({ ...newBanner, image_url: publicUrl });
    toast.success("Image uploadée avec succès");
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Ajouter une bannière</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Les bannières apparaîtront entre chaque 6 annonces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
          <div>
            <Label htmlFor="title" className="text-sm">Titre</Label>
            <Input
              id="title"
              value={newBanner.title}
              onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              placeholder="Titre de la bannière"
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-sm">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm"
            />
            {newBanner.image_url && (
              <img
                src={newBanner.image_url}
                alt="Preview"
                className="mt-2 h-24 sm:h-32 object-cover rounded"
              />
            )}
          </div>

          <div>
            <Label htmlFor="link" className="text-sm">Lien (optionnel)</Label>
            <Input
              id="link"
              value={newBanner.link_url}
              onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
              placeholder="https://..."
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="order" className="text-sm">Ordre d'affichage</Label>
            <Input
              id="order"
              type="number"
              value={newBanner.display_order}
              onChange={(e) => setNewBanner({ ...newBanner, display_order: parseInt(e.target.value) })}
              className="text-sm w-24"
            />
          </div>

          <Button
            onClick={() => createBanner.mutate(newBanner)}
            disabled={!newBanner.title || !newBanner.image_url}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold px-1">Bannières ({banners.length})</h3>
        {banners.map((banner) => (
          <Card key={banner.id}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full sm:w-32 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{banner.title}</h4>
                  {banner.link_url && (
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{banner.link_url}</span>
                    </a>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground">Ordre: {banner.display_order}</p>
                </div>
                <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${banner.id}`} className="text-xs sm:text-sm">Active</Label>
                    <Switch
                      id={`active-${banner.id}`}
                      checked={banner.active}
                      onCheckedChange={(checked) => 
                        updateBanner.mutate({ id: banner.id, active: checked })
                      }
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteBanner.mutate(banner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
