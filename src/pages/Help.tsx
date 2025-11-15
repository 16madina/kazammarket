import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, MessageCircle, Mail } from "lucide-react";

const Help = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Comment publier une annonce ?",
      answer: "Pour publier une annonce, cliquez sur le bouton '+' en bas de l'écran, remplissez le formulaire avec les détails de votre article, ajoutez des photos et publiez. Votre annonce sera vérifiée avant d'être publiée."
    },
    {
      question: "Comment contacter un vendeur ?",
      answer: "Sur la page de l'annonce, cliquez sur 'Contacter le vendeur' pour envoyer un message directement. Vous pouvez négocier le prix et organiser la transaction via la messagerie."
    },
    {
      question: "Comment modifier mon profil ?",
      answer: "Allez dans Profil > Paramètres > Détails personnels pour modifier vos informations personnelles, votre photo de profil et vos coordonnées."
    },
    {
      question: "Que faire en cas d'annonce suspecte ?",
      answer: "Sur la page de l'annonce, cliquez sur les trois points en haut à droite et sélectionnez 'Signaler'. Choisissez la raison du signalement et notre équipe examinera le contenu."
    },
    {
      question: "Comment supprimer mon annonce ?",
      answer: "Allez dans votre profil, sélectionnez l'annonce à supprimer, cliquez sur 'Gérer' puis 'Supprimer l'annonce'. Cette action est irréversible."
    },
    {
      question: "Les transactions sont-elles sécurisées ?",
      answer: "ReVivo est une plateforme de mise en relation. Nous recommandons de rencontrer les vendeurs dans des lieux publics et d'inspecter l'article avant le paiement."
    }
  ];

  return (
    <div className="min-h-screen pb-24 bg-background">
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Centre d'aide</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Questions fréquentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">Nous contacter</h2>
          <p className="text-sm text-muted-foreground">
            Vous ne trouvez pas la réponse à votre question ? Contactez notre équipe de support.
          </p>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3">
              <MessageCircle className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Chat en direct</div>
                <div className="text-xs text-muted-foreground">Réponse en quelques minutes</div>
              </div>
            </Button>

            <Button variant="outline" className="w-full justify-start gap-3">
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Email</div>
                <div className="text-xs text-muted-foreground">support@revivo.com</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default Help;
