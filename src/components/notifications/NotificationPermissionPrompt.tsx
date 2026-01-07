import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationPermissionPromptProps {
  onDismiss?: () => void;
}

export const NotificationPermissionPrompt = ({ onDismiss }: NotificationPermissionPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const nativeNotifications = usePushNotifications();
  const webNotifications = useWebPushNotifications();

  const isNative = nativeNotifications.isNative;

  useEffect(() => {
    // Check if we should show the prompt
    let hasSeenPrompt: string | null = null;
    try {
      hasSeenPrompt = localStorage.getItem('ayoka_notification_prompt_seen');
    } catch {
      hasSeenPrompt = null;
    }

    if (hasSeenPrompt) {
      setShowPrompt(false);
      return;
    }

    // For native apps, check if already registered
    if (isNative && nativeNotifications.isRegistered) {
      setShowPrompt(false);
      return;
    }

    // For native apps, check permission status
    if (isNative && nativeNotifications.permissionStatus === 'denied') {
      setShowPrompt(false);
      return;
    }

    // For web, check permission status
    if (!isNative && webNotifications.isPermissionGranted) {
      setShowPrompt(false);
      return;
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isNative, nativeNotifications.isRegistered, nativeNotifications.permissionStatus, webNotifications.isPermissionGranted]);

  const handleAccept = async () => {
    setIsLoading(true);
    
    try {
      if (isNative) {
        await nativeNotifications.requestPermission();
      } else {
        await webNotifications.requestPermission();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
      setShowPrompt(false);
      try {
        localStorage.setItem('ayoka_notification_prompt_seen', 'true');
      } catch {
        // ignore
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    try {
      localStorage.setItem('ayoka_notification_prompt_seen', 'true');
    } catch {
      // ignore
    }
    onDismiss?.();
  };

  if (!showPrompt || dismissed) return null;

  // Don't show if notifications aren't supported on web
  if (!isNative && !webNotifications.isSupported) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 p-4 bg-card border-border shadow-lg animate-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-4 md:max-w-sm">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">
            Activer les notifications
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Recevez des alertes pour les nouveaux messages, offres et promotions.
          </p>
          
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Activation...' : 'Activer'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
