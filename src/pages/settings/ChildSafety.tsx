import { useEffect } from "react";
import { ArrowLeft, Shield, AlertTriangle, Ban, Eye, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChildSafety = () => {
  useEffect(() => {
    document.title = "Sécurité et Protection - AYOKA MARKET";
  }, []);
  const navigate = useNavigate();

  const safetyMeasures = [
    {
      icon: Ban,
      title: "Interdiction aux mineurs",
      content: "AYOKA MARKET est une plateforme exclusivement réservée aux utilisateurs âgés de 18 ans et plus. L'inscription et l'utilisation de nos services sont strictement interdites aux mineurs."
    },
    {
      icon: Shield,
      title: "Modération du contenu",
      content: "Tout contenu publié sur notre plateforme est soumis à une modération stricte. Les annonces inappropriées, offensantes ou illégales sont immédiatement supprimées et les utilisateurs concernés sont bannis."
    },
    {
      icon: AlertTriangle,
      title: "Système de signalement",
      content: "Les utilisateurs peuvent signaler tout contenu ou comportement suspect en utilisant le bouton de signalement disponible sur chaque annonce et conversation. Chaque signalement est traité sous 24 heures."
    },
    {
      icon: Eye,
      title: "Filtrage automatique",
      content: "Notre système de filtrage automatique détecte et bloque les contenus contenant des termes inappropriés, offensants ou potentiellement dangereux avant leur publication."
    },
    {
      icon: Users,
      title: "Blocage des utilisateurs",
      content: "Les utilisateurs peuvent bloquer d'autres utilisateurs pour éviter tout contact non désiré. Les utilisateurs bloqués ne peuvent plus voir vos annonces ni vous envoyer de messages."
    },
    {
      icon: MessageSquare,
      title: "Messagerie sécurisée",
      content: "Notre système de messagerie intégré permet des échanges sécurisés entre acheteurs et vendeurs sans partager d'informations personnelles sensibles."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Sécurité et Protection</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-8 space-y-6">
        {/* Hero Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Protection et Sécurité</h2>
                <p className="text-muted-foreground">AYOKA MARKET</p>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              Chez AYOKA MARKET, la sécurité de notre communauté est notre priorité absolue. 
              Nous mettons en œuvre des mesures strictes pour garantir un environnement sûr 
              et respectueux pour tous nos utilisateurs.
            </p>
          </CardContent>
        </Card>

        {/* Age Restriction Notice */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-destructive mb-2">Restriction d'âge</h3>
                <p className="text-foreground/80">
                  <strong>AYOKA MARKET est strictement réservé aux personnes majeures (18 ans et plus).</strong> 
                  {" "}L'utilisation de notre plateforme par des mineurs est interdite. En vous inscrivant, 
                  vous confirmez avoir au moins 18 ans.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Measures */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Nos mesures de sécurité</h2>
          
          {safetyMeasures.map((measure, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-base">
                  <measure.icon className="h-5 w-5 text-primary" />
                  {measure.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {measure.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reporting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comment signaler un problème ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Si vous rencontrez un contenu ou un comportement inapproprié, vous pouvez :
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-2">
              <li>Utiliser le bouton "Signaler" disponible sur chaque annonce</li>
              <li>Signaler une conversation depuis le menu de la messagerie</li>
              <li>Contacter notre équipe de support à <strong>ayokamarket@gmail.com</strong></li>
            </ul>
            <p className="text-muted-foreground text-sm">
              Tous les signalements sont traités dans un délai de 24 heures. Les utilisateurs 
              enfreignant nos règles seront bannis définitivement de la plateforme.
            </p>
          </CardContent>
        </Card>

        {/* Zero Tolerance Policy */}
        <Card className="border-primary/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Politique de tolérance zéro</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AYOKA MARKET applique une politique de tolérance zéro envers tout contenu ou 
              comportement illégal, offensant, discriminatoire, abusif, frauduleux, violent 
              ou pornographique. Tout utilisateur enfreignant ces règles sera immédiatement 
              et définitivement banni de notre plateforme.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground text-sm">
              Pour toute question concernant notre politique de sécurité, contactez-nous :
            </p>
            <p className="font-medium text-foreground mt-2">ayokamarket@gmail.com</p>
            <p className="text-xs text-muted-foreground mt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChildSafety;
