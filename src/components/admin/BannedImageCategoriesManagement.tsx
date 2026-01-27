import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, ImageOff, Shield } from "lucide-react";

interface BannedImageCategory {
  id: string;
  name: string;
  description: string | null;
  severity: string;
  active: boolean;
  created_at: string;
}

export const BannedImageCategoriesManagement = () => {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState({ name: "", description: "", severity: "high" });
  const [editingCategory, setEditingCategory] = useState<BannedImageCategory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["banned-image-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banned_image_categories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BannedImageCategory[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (category: { name: string; description: string; severity: string }) => {
      const { error } = await supabase
        .from("banned_image_categories")
        .insert({
          name: category.name,
          description: category.description || null,
          severity: category.severity,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banned-image-categories"] });
      setNewCategory({ name: "", description: "", severity: "high" });
      setIsAddDialogOpen(false);
      toast.success("Catégorie ajoutée avec succès");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("Cette catégorie existe déjà");
      } else {
        toast.error("Erreur lors de l'ajout de la catégorie");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (category: BannedImageCategory) => {
      const { error } = await supabase
        .from("banned_image_categories")
        .update({
          name: category.name,
          description: category.description,
          severity: category.severity,
          active: category.active,
        })
        .eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banned-image-categories"] });
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      toast.success("Catégorie mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banned_image_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banned-image-categories"] });
      toast.success("Catégorie supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("banned_image_categories")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banned-image-categories"] });
      toast.success("Statut mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">Haute</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-orange-500">Moyenne</Badge>;
      case "low":
        return <Badge variant="secondary">Basse</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }
    addMutation.mutate(newCategory);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateMutation.mutate(editingCategory);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <ImageOff className="h-4 w-4 sm:h-5 sm:w-5" />
          Catégories interdites
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-[calc(100%-2rem)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Ajouter une catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Nom de la catégorie</Label>
                <Input
                  id="name"
                  placeholder="Ex: Contenu violent"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description" className="text-xs sm:text-sm">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Description..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="severity" className="text-xs sm:text-sm">Sévérité</Label>
                <Select
                  value={newCategory.severity}
                  onValueChange={(value) => setNewCategory({ ...newCategory, severity: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Haute - Rejet</SelectItem>
                    <SelectItem value="medium">Moyenne - Alerte</SelectItem>
                    <SelectItem value="low">Basse - Avertir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddCategory} 
                disabled={addMutation.isPending}
                className="w-full"
                size="sm"
              >
                {addMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {isLoading ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Chargement...</div>
        ) : categories?.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Shield className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm">Aucune catégorie définie</p>
            <p className="text-xs sm:text-sm">Ajoutez des catégories pour la modération</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {categories?.map((category) => (
              <div
                key={category.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border ${
                  !category.active ? "opacity-50 bg-muted" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="font-medium text-sm sm:text-base">{category.name}</span>
                    {getSeverityBadge(category.severity)}
                    {!category.active && <Badge variant="outline" className="text-[10px] sm:text-xs">Désactivé</Badge>}
                  </div>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Switch
                    checked={category.active}
                    onCheckedChange={(checked) => 
                      toggleActiveMutation.mutate({ id: category.id, active: checked })
                    }
                  />
                  <Dialog open={isEditDialogOpen && editingCategory?.id === category.id} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setEditingCategory(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="mx-4 max-w-[calc(100%-2rem)] sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Modifier</DialogTitle>
                      </DialogHeader>
                      {editingCategory && (
                        <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="edit-name" className="text-xs sm:text-sm">Nom</Label>
                            <Input
                              id="edit-name"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ 
                                ...editingCategory, 
                                name: e.target.value 
                              })}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="edit-description" className="text-xs sm:text-sm">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={editingCategory.description || ""}
                              onChange={(e) => setEditingCategory({ 
                                ...editingCategory, 
                                description: e.target.value 
                              })}
                              rows={3}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="edit-severity" className="text-xs sm:text-sm">Sévérité</Label>
                            <Select
                              value={editingCategory.severity}
                              onValueChange={(value) => setEditingCategory({ 
                                ...editingCategory, 
                                severity: value 
                              })}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">Haute</SelectItem>
                                <SelectItem value="medium">Moyenne</SelectItem>
                                <SelectItem value="low">Basse</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={handleUpdateCategory}
                            disabled={updateMutation.isPending}
                            className="w-full"
                            size="sm"
                          >
                            {updateMutation.isPending ? "..." : "Enregistrer"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      if (confirm("Supprimer ?")) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
