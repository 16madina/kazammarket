import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Heart, X } from "lucide-react";
import { useAppRating } from "@/hooks/useAppRating";

interface AppRatingPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRated: () => void;
  onDismiss: () => void;
  onDismissPermanently: () => void;
}

export const AppRatingPrompt = ({
  open,
  onOpenChange,
  onRated,
  onDismiss,
  onDismissPermanently,
}: AppRatingPromptProps) => {
  const { openAppStore } = useAppRating();

  const handleRate = () => {
    openAppStore();
    onRated();
    onOpenChange(false);
  };

  const handleLater = () => {
    onDismiss();
    onOpenChange(false);
  };

  const handleNever = () => {
    onDismissPermanently();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Heart className="h-16 w-16 text-primary fill-primary/20" />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <Star className="h-5 w-5 text-white fill-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl">Vous aimez AYOKA ?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Votre avis nous aide à améliorer l'application et à atteindre plus d'utilisateurs. 
            Prenez un moment pour nous noter !
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-4">
          <div className="flex justify-center gap-1 pb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="h-8 w-8 text-yellow-400 fill-yellow-400 cursor-pointer hover:scale-110 transition-transform"
                onClick={handleRate}
              />
            ))}
          </div>

          <Button 
            onClick={handleRate} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Star className="h-4 w-4 mr-2" />
            Noter maintenant
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleLater}
            className="w-full"
          >
            Plus tard
          </Button>
          
          <button
            onClick={handleNever}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Ne plus demander
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
