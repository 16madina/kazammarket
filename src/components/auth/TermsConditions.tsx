import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsConditionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsConditions = ({ open, onOpenChange }: TermsConditionsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conditions générales d'utilisation</DialogTitle>
          <DialogDescription>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Acceptation des conditions</h3>
              <p className="text-muted-foreground">
                En vous inscrivant et en utilisant ReVivo, vous acceptez d'être lié par ces conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Description du service</h3>
              <p className="text-muted-foreground">
                ReVivo est une plateforme de petites annonces permettant aux utilisateurs de publier, rechercher et acheter des articles d'occasion ou neufs. Nous facilitons la mise en relation entre acheteurs et vendeurs.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Inscription et compte utilisateur</h3>
              <p className="text-muted-foreground">
                Pour utiliser certaines fonctionnalités de ReVivo, vous devez créer un compte. Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Fournir des informations exactes et à jour</li>
                <li>Maintenir la confidentialité de votre mot de passe</li>
                <li>Être responsable de toute activité sur votre compte</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Publication d'annonces</h3>
              <p className="text-muted-foreground">
                Lors de la publication d'une annonce, vous vous engagez à :
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Fournir des descriptions exactes et complètes des articles</li>
                <li>Ne publier que du contenu légal et approprié</li>
                <li>Ne pas publier de contenu offensant, trompeur ou frauduleux</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Être le propriétaire légitime des articles vendus</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Transactions</h3>
              <p className="text-muted-foreground">
                ReVivo facilite la mise en relation entre acheteurs et vendeurs, mais n'est pas partie aux transactions. Les utilisateurs sont responsables de :
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>La négociation des prix et conditions</li>
                <li>L'organisation de la livraison ou du retrait</li>
                <li>La vérification de l'état des articles</li>
                <li>Le paiement et la livraison des articles</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Comportement interdit</h3>
              <p className="text-muted-foreground">
                Il est strictement interdit de :
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Publier du contenu illégal ou frauduleux</li>
                <li>Usurper l'identité d'une autre personne</li>
                <li>Harceler ou menacer d'autres utilisateurs</li>
                <li>Utiliser la plateforme à des fins illégales</li>
                <li>Contourner les mesures de sécurité</li>
                <li>Collecter des données d'autres utilisateurs sans autorisation</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Propriété intellectuelle</h3>
              <p className="text-muted-foreground">
                Tous les éléments de la plateforme ReVivo (logo, design, code) sont protégés par les droits de propriété intellectuelle. Vous conservez les droits sur le contenu que vous publiez, mais accordez à ReVivo une licence pour afficher ce contenu sur la plateforme.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Résiliation</h3>
              <p className="text-muted-foreground">
                Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation de ces conditions, sans préavis. Vous pouvez également supprimer votre compte à tout moment depuis les paramètres.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Limitation de responsabilité</h3>
              <p className="text-muted-foreground">
                ReVivo ne peut être tenu responsable des transactions entre utilisateurs, de la qualité des articles, des retards de livraison, ou de tout dommage résultant de l'utilisation de la plateforme.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Modifications des conditions</h3>
              <p className="text-muted-foreground">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront effectives dès leur publication sur la plateforme. Votre utilisation continue de ReVivo après ces modifications constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">11. Contact</h3>
              <p className="text-muted-foreground">
                Pour toute question concernant ces conditions, veuillez nous contacter via les paramètres de votre compte.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
