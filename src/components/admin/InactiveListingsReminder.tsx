import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Calendar, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const DEFAULT_MESSAGE = `Bonjour,

Nous avons remarqué que votre annonce "{TITLE}" est en ligne depuis plus de 10 jours.

Si l'article est toujours disponible, n'hésitez pas à la promouvoir pour augmenter sa visibilité.

Si l'article a été vendu, pensez à mettre à jour le statut de votre annonce.

Merci d'utiliser BAZARAM !

L'équipe Admin BAZARAM`;

export const InactiveListingsReminder = () => {
  const navigate = useNavigate();
  const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  // Fetch listings older than 10 days
  const { data: inactiveListings, isLoading, refetch } = useQuery({
    queryKey: ["inactive-listings"],
    queryFn: async () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          categories(name),
          profiles(full_name, phone, email)
        `)
        .eq("status", "active")
        .lt("created_at", tenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleSendReminder = async (listing: any) => {
    if (!listing) return;

    setSendingTo(listing.id);
    try {
      const personalizedMessage = customMessage.replace("{TITLE}", listing.title);

      // Create system notification
      const { error: notifError } = await supabase
        .from("system_notifications")
        .insert({
          user_id: listing.user_id,
          title: "Rappel - Annonce inactive",
          message: personalizedMessage,
          notification_type: "reminder",
          metadata: {
            listing_id: listing.id,
            listing_title: listing.title,
          },
        });

      if (notifError) throw notifError;

      // Also send email via edge function
      await supabase.functions.invoke("send-inactive-listing-reminder", {
        body: {
          userId: listing.user_id,
          listingTitle: listing.title,
          listingId: listing.id,
        },
      });

      toast.success("Rappel envoyé avec succès");
      refetch();
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Erreur lors de l'envoi du rappel");
    } finally {
      setSendingTo(null);
    }
  };

  const handleSendAllReminders = async () => {
    if (!inactiveListings || inactiveListings.length === 0) return;

    setSendingTo("all");
    try {
      for (const listing of inactiveListings) {
        const personalizedMessage = customMessage.replace("{TITLE}", listing.title);

        await supabase.from("system_notifications").insert({
          user_id: listing.user_id,
          title: "Rappel - Annonce inactive",
          message: personalizedMessage,
          notification_type: "reminder",
          metadata: {
            listing_id: listing.id,
            listing_title: listing.title,
          },
        });

        await supabase.functions.invoke("send-inactive-listing-reminder", {
          body: {
            userId: listing.user_id,
            listingTitle: listing.title,
            listingId: listing.id,
          },
        });
      }

      toast.success(`${inactiveListings.length} rappels envoyés avec succès`);
      refetch();
    } catch (error) {
      console.error("Error sending reminders:", error);
      toast.error("Erreur lors de l'envoi des rappels");
    } finally {
      setSendingTo(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Message de rappel</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={8}
            className="font-mono text-xs sm:text-sm"
            placeholder="Personnalisez votre message de rappel..."
          />
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
            Utilisez {"{TITLE}"} pour insérer le titre de l'annonce
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <h3 className="text-base sm:text-lg font-semibold">
          Inactives ({inactiveListings?.length || 0})
        </h3>
        {inactiveListings && inactiveListings.length > 0 && (
          <Button
            onClick={handleSendAllReminders}
            disabled={sendingTo === "all"}
            variant="default"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendingTo === "all" ? "Envoi..." : "Envoyer tous"}
          </Button>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3">
        {!inactiveListings || inactiveListings.length === 0 ? (
          <Card>
            <CardContent className="py-6 sm:py-8 text-center text-muted-foreground text-sm">
              Aucune annonce inactive de plus de 10 jours
            </CardContent>
          </Card>
        ) : (
          inactiveListings.map((listing: any) => (
            <Card key={listing.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h4 className="font-semibold text-sm sm:text-base truncate">{listing.title}</h4>
                      <Badge variant="outline" className="text-[10px] sm:text-xs">
                        {listing.categories?.name || "Catégorie inconnue"}
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
                      <p className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        Publiée{" "}
                        {formatDistanceToNow(new Date(listing.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                      <p className="truncate">
                        Vendeur: {listing.profiles?.full_name || "Non renseigné"}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>{listing.price?.toLocaleString()} {listing.currency}</span>
                        <span>Vues: {listing.views || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="flex-1 sm:flex-none h-8 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSendReminder(listing)}
                      disabled={sendingTo === listing.id || sendingTo === "all"}
                      className="flex-1 sm:flex-none h-8 text-xs"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {sendingTo === listing.id ? "..." : "Envoyer"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
