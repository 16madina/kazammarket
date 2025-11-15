import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationSettings = ({ open, onOpenChange }: NotificationSettingsProps) => {
  const [settings, setSettings] = useState({
    messages: true,
    offers: true,
    favorites: true,
    newListings: false,
    priceDrops: true,
    marketing: false,
    email: true,
    push: true
  });

  const handleSave = () => {
    toast.success("Paramètres de notification enregistrés");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Préférences de notifications</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4 space-y-4">
            <h3 className="font-medium text-sm">Notifications de l'application</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Messages</Label>
                <p className="text-xs text-muted-foreground">Nouveaux messages des acheteurs</p>
              </div>
              <Switch
                checked={settings.messages}
                onCheckedChange={(checked) => setSettings({ ...settings, messages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Offres de prix</Label>
                <p className="text-xs text-muted-foreground">Propositions de prix sur vos annonces</p>
              </div>
              <Switch
                checked={settings.offers}
                onCheckedChange={(checked) => setSettings({ ...settings, offers: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Favoris</Label>
                <p className="text-xs text-muted-foreground">Activité sur vos annonces favorites</p>
              </div>
              <Switch
                checked={settings.favorites}
                onCheckedChange={(checked) => setSettings({ ...settings, favorites: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nouvelles annonces</Label>
                <p className="text-xs text-muted-foreground">Annonces correspondant à vos recherches</p>
              </div>
              <Switch
                checked={settings.newListings}
                onCheckedChange={(checked) => setSettings({ ...settings, newListings: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Baisse de prix</Label>
                <p className="text-xs text-muted-foreground">Prix réduits sur vos favoris</p>
              </div>
              <Switch
                checked={settings.priceDrops}
                onCheckedChange={(checked) => setSettings({ ...settings, priceDrops: checked })}
              />
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <h3 className="font-medium text-sm">Canaux de notification</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications push</Label>
                <p className="text-xs text-muted-foreground">Recevoir des notifications sur l'appareil</p>
              </div>
              <Switch
                checked={settings.push}
                onCheckedChange={(checked) => setSettings({ ...settings, push: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email</Label>
                <p className="text-xs text-muted-foreground">Recevoir des emails de notification</p>
              </div>
              <Switch
                checked={settings.email}
                onCheckedChange={(checked) => setSettings({ ...settings, email: checked })}
              />
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <h3 className="font-medium text-sm">Marketing</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Offres promotionnelles</Label>
                <p className="text-xs text-muted-foreground">Recevoir des offres et conseils</p>
              </div>
              <Switch
                checked={settings.marketing}
                onCheckedChange={(checked) => setSettings({ ...settings, marketing: checked })}
              />
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full">
            Enregistrer les préférences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
