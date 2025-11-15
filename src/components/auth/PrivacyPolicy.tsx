import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicy = ({ open, onOpenChange }: PrivacyPolicyProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Politique de confidentialité</DialogTitle>
          <DialogDescription>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Collecte des informations</h3>
              <p className="text-muted-foreground">
                Nous collectons les informations que vous nous fournissez directement lors de votre inscription, notamment votre nom, prénom, email, numéro de téléphone, pays et ville. Ces informations sont nécessaires pour créer et gérer votre compte ReVivo.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Utilisation des informations</h3>
              <p className="text-muted-foreground">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Permettre la publication et la gestion de vos annonces</li>
                <li>Faciliter la communication entre acheteurs et vendeurs</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Vous envoyer des notifications importantes concernant votre compte</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Partage des informations</h3>
              <p className="text-muted-foreground">
                Vos informations personnelles ne sont jamais vendues à des tiers. Certaines informations de votre profil (nom, ville, pays) peuvent être visibles par d'autres utilisateurs dans le cadre des transactions sur la plateforme.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Sécurité des données</h3>
              <p className="text-muted-foreground">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Vos données sont stockées de manière sécurisée et chiffrées.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. Vos droits</h3>
              <p className="text-muted-foreground">
                Vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit de limitation du traitement</li>
                <li>Droit à la portabilité de vos données</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Cookies</h3>
              <p className="text-muted-foreground">
                Notre plateforme utilise des cookies essentiels pour assurer le bon fonctionnement du site et maintenir votre session active. Ces cookies ne collectent pas d'informations personnelles à des fins publicitaires.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Contact</h3>
              <p className="text-muted-foreground">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter via les paramètres de votre compte ou par email.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
