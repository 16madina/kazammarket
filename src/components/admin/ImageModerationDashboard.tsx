import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ShieldX, ShieldCheck, Eye, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ImageModerationDashboard = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterSafe, setFilterSafe] = useState<boolean | null>(false); // Default: show rejected

  const { data: moderationLogs, isLoading, refetch } = useQuery({
    queryKey: ["moderation-logs", filterSafe],
    queryFn: async () => {
      let query = supabase
        .from("image_moderation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filterSafe !== null) {
        query = query.eq("is_safe", filterSafe);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get user profiles for logs with user_id
      if (data && data.length > 0) {
        const userIds = [...new Set(data.filter(log => log.user_id).map(log => log.user_id))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

          return data.map(log => ({
            ...log,
            profile: log.user_id ? profileMap.get(log.user_id) : null
          }));
        }
      }

      return data || [];
    },
  });

  const stats = {
    total: moderationLogs?.length || 0,
    rejected: moderationLogs?.filter(log => !log.is_safe).length || 0,
    approved: moderationLogs?.filter(log => log.is_safe).length || 0,
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total analysées</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejetées</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approuvées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filterSafe === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterSafe(null)}
              >
                Toutes
              </Button>
              <Button
                variant={filterSafe === false ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterSafe(false)}
              >
                <ShieldX className="h-4 w-4 mr-1" />
                Rejetées
              </Button>
              <Button
                variant={filterSafe === true ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterSafe(true)}
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                Approuvées
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldX className="h-5 w-5" />
            Historique de modération ({moderationLogs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : moderationLogs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log de modération trouvé
            </div>
          ) : (
            <div className="space-y-3">
              {moderationLogs?.map((log: any) => (
                <Card key={log.id} className={`p-4 ${!log.is_safe ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div 
                      className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted cursor-pointer shrink-0"
                      onClick={() => setSelectedImage(log.image_url)}
                    >
                      <img
                        src={log.image_url}
                        alt="Moderated image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={log.is_safe ? "default" : "destructive"}>
                          {log.is_safe ? (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Approuvée
                            </>
                          ) : (
                            <>
                              <ShieldX className="h-3 w-3 mr-1" />
                              Rejetée
                            </>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>

                      {log.reason && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Raison:</span> {log.reason}
                        </p>
                      )}

                      {log.profile && (
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={log.profile.avatar_url || ""} />
                            <AvatarFallback className="text-xs">
                              {log.profile.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">
                            {log.profile.full_name || "Utilisateur inconnu"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(log.image_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l'image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Preview"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
