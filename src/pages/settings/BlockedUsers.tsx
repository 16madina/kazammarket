import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const BlockedUsers = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    checkAuth();
  }, []);

  const { data: blockedUsers, isLoading, refetch } = useQuery({
    queryKey: ["blocked-users", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("blocked_users")
        .select(`
          id,
          blocked_id,
          created_at,
          profiles:blocked_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("blocker_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const handleUnblock = async (blockId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("id", blockId);

      if (error) throw error;

      toast.success(`${userName} débloqué avec succès`);
      refetch();
    } catch (error: any) {
      toast.error("Erreur lors du déblocage");
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
          <h1 className="text-xl font-semibold">Utilisateurs bloqués</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Chargement...
          </div>
        ) : !blockedUsers || blockedUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserX className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Vous n'avez bloqué aucun utilisateur
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((block: any) => (
              <Card key={block.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={block.profiles?.avatar_url} />
                        <AvatarFallback>
                          {block.profiles?.full_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {block.profiles?.full_name || "Utilisateur"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bloqué le {new Date(block.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(block.id, block.profiles?.full_name || "cet utilisateur")}
                    >
                      Débloquer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsers;
