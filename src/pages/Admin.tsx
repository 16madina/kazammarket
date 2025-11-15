import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Users, FileText, ShieldAlert, Mail, MessageSquare, Ban, CheckCircle, XCircle, Eye, Phone } from "lucide-react";
import { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast.error("Accès refusé");
        navigate("/profile");
        return;
      }
      setIsAdmin(true);
    };

    checkAuth();
  }, [navigate]);

  // Fetch all users
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all listings
  const { data: listings, refetch: refetchListings } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          categories(name),
          profiles(full_name, phone)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all reports
  const { data: reports, refetch: refetchReports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          listings(id, title, images, price)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Fetch reporter profiles separately
      if (data && data.length > 0) {
        const reporterIds = data.map(r => r.reporter_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", reporterIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        return data.map(report => ({
          ...report,
          reporter_profile: profilesMap.get(report.reporter_id)
        })) as any;
      }
      
      return data as any;
    },
    enabled: isAdmin,
  });

  const handleBanUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: banReason,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Erreur lors du bannissement");
      return;
    }

    toast.success("Utilisateur banni");
    refetchUsers();
    setBanReason("");
  };

  const handleUnbanUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: null,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Erreur lors du débannissement");
      return;
    }

    toast.success("Utilisateur débanni");
    refetchUsers();
  };

  const handleApproveListing = async (listingId: string) => {
    const { error } = await supabase
      .from("listings")
      .update({
        moderation_status: "approved",
        moderated_at: new Date().toISOString(),
        moderated_by: user?.id,
      })
      .eq("id", listingId);

    if (error) {
      toast.error("Erreur lors de l'approbation");
      return;
    }

    toast.success("Annonce approuvée");
    refetchListings();
  };

  const handleRejectListing = async (listingId: string, notes: string) => {
    const { error } = await supabase
      .from("listings")
      .update({
        moderation_status: "rejected",
        moderated_at: new Date().toISOString(),
        moderated_by: user?.id,
        moderation_notes: notes,
        status: "inactive",
      })
      .eq("id", listingId);

    if (error) {
      toast.error("Erreur lors du rejet");
      return;
    }

    toast.success("Annonce rejetée");
    refetchListings();
  };

  const handleSendMessage = async (userId: string) => {
    toast.info("Fonctionnalité de messagerie à implémenter avec un service externe");
  };

  const handleSendEmail = async (email: string) => {
    toast.info(`Email à envoyer à: ${email}`);
  };

  const handleSendSMS = async (phone: string) => {
    toast.info(`SMS à envoyer au: ${phone}`);
  };

  const handleResolveReport = async (reportId: string) => {
    const { error } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id,
      })
      .eq("id", reportId);

    if (error) {
      toast.error("Erreur lors de la résolution");
      return;
    }

    toast.success("Signalement résolu");
    refetchReports();
  };

  const handleDismissReport = async (reportId: string, notes: string) => {
    const { error } = await supabase
      .from("reports")
      .update({
        status: "dismissed",
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id,
        admin_notes: notes,
      })
      .eq("id", reportId);

    if (error) {
      toast.error("Erreur lors du rejet");
      return;
    }

    toast.success("Signalement rejeté");
    refetchReports();
  };

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Panneau d'administration</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Annonces
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Signalements
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tous les utilisateurs ({users?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {users?.map((profile) => (
                  <Card key={profile.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{profile.full_name || "Utilisateur"}</h3>
                          {profile.is_banned && (
                            <Badge variant="destructive">Banni</Badge>
                          )}
                          {profile.verified_seller && (
                            <Badge variant="default">Vérifié</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <p className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Email: Contact via profil
                          </p>
                          {profile.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {profile.phone}
                            </p>
                          )}
                          <p>Localisation: {profile.city}, {profile.country}</p>
                          <p>Inscrit: {new Date(profile.created_at).toLocaleDateString()}</p>
                          <p>Ventes: {profile.total_sales || 0}</p>
                          <p>Note: {profile.rating_average || 0}/5 ({profile.rating_count || 0} avis)</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/seller/${profile.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(profile)}>
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Envoyer un message</DialogTitle>
                            </DialogHeader>
                            <Textarea
                              placeholder="Votre message..."
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                            />
                            <DialogFooter>
                              <Button onClick={() => handleSendMessage(profile.id)}>
                                Envoyer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {profile.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendSMS(profile.phone)}
                          >
                            SMS
                          </Button>
                        )}
                        {profile.is_banned ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUnbanUser(profile.id)}
                          >
                            Débannir
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Ban className="h-3 w-3 mr-1" />
                                Bannir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bannir l'utilisateur</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action bannira l'utilisateur. Indiquez la raison:
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Input
                                placeholder="Raison du bannissement..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleBanUser(profile.id)}>
                                  Confirmer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les annonces ({listings?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listings?.map((listing) => (
                  <Card key={listing.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-lg font-bold text-primary">
                              {listing.price > 0 ? `${listing.price.toLocaleString()} FCFA` : "Gratuit"}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={
                                listing.moderation_status === "approved" ? "default" :
                                listing.moderation_status === "rejected" ? "destructive" :
                                "secondary"
                              }>
                                {listing.moderation_status === "approved" ? "Approuvé" :
                                 listing.moderation_status === "rejected" ? "Rejeté" :
                                 "En attente"}
                              </Badge>
                              <Badge variant="outline">{listing.categories?.name}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Par: {listing.profiles?.full_name || "Utilisateur"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vues: {listing.views || 0} | Créé: {new Date(listing.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/listing/${listing.id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir
                            </Button>
                            {listing.moderation_status !== "approved" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveListing(listing.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approuver
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive" onClick={() => setSelectedListing(listing)}>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejeter
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rejeter l'annonce</DialogTitle>
                                  <DialogDescription>
                                    Indiquez la raison du rejet:
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  placeholder="Raison du rejet..."
                                  value={messageContent}
                                  onChange={(e) => setMessageContent(e.target.value)}
                                />
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      if (selectedListing) {
                                        handleRejectListing(selectedListing.id, messageContent);
                                        setMessageContent("");
                                      }
                                    }}
                                  >
                                    Confirmer le rejet
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tous les signalements ({reports?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports?.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={report.listings?.images?.[0] || "/placeholder.svg"}
                        alt={report.listings?.title}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{report.listings?.title}</h3>
                            <p className="text-lg font-bold text-primary">
                              {report.listings?.price > 0 ? `${report.listings.price.toLocaleString()} FCFA` : "Gratuit"}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={
                                report.status === "resolved" ? "default" :
                                report.status === "dismissed" ? "secondary" :
                                report.status === "reviewing" ? "outline" :
                                "destructive"
                              }>
                                {report.status === "resolved" ? "Résolu" :
                                 report.status === "dismissed" ? "Rejeté" :
                                 report.status === "reviewing" ? "En cours" :
                                 "En attente"}
                              </Badge>
                              <Badge variant="outline">
                                {report.reason === "inappropriate" ? "Contenu inapproprié" :
                                 report.reason === "scam" ? "Arnaque" :
                                 report.reason === "spam" ? "Spam" :
                                 report.reason === "fake" ? "Contrefait" :
                                 report.reason === "misleading" ? "Trompeur" :
                                 "Autre"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Signalé par: {report.reporter_profile?.full_name || "Utilisateur"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()} à {new Date(report.created_at).toLocaleTimeString()}
                            </p>
                            <div className="mt-2 p-2 bg-muted rounded-md">
                              <p className="text-sm"><strong>Détails:</strong> {report.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/listing/${report.listing_id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir annonce
                            </Button>
                            {report.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleResolveReport(report.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Résoudre
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Rejeter
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Rejeter le signalement</DialogTitle>
                                      <DialogDescription>
                                        Indiquez pourquoi ce signalement n'est pas valide:
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      placeholder="Notes administratives..."
                                      value={messageContent}
                                      onChange={(e) => setMessageContent(e.target.value)}
                                    />
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          handleDismissReport(report.id, messageContent);
                                          setMessageContent("");
                                        }}
                                      >
                                        Confirmer le rejet
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {(!reports || reports.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun signalement pour le moment
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Admin;
