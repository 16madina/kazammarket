import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    if (!isNative) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    const initializePushNotifications = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Vérifier le statut actuel des permissions
        const permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'denied') {
          setPermissionStatus('denied');
          return;
        }

        if (permStatus.receive === 'prompt') {
          // Demander la permission pour les notifications
          const permission = await PushNotifications.requestPermissions();
          
          if (permission.receive !== 'granted') {
            setPermissionStatus('denied');
            return;
          }
        }

        setPermissionStatus('granted');

        // Enregistrer pour les notifications push
        await PushNotifications.register();
        setIsRegistered(true);

        // Écouter l'enregistrement réussi
        PushNotifications.addListener('registration', async (token: Token) => {
          console.log(`Push registration success (${platform}), token:`, token.value);
          setPushToken(token.value);

          // Sauvegarder le token dans la base de données
          const { error } = await supabase
            .from('profiles')
            .update({ push_token: token.value })
            .eq('id', user.id);

          if (error) {
            console.error('Error saving push token:', error);
          } else {
            console.log('Push token saved successfully');
          }
        });

        // Écouter les erreurs d'enregistrement
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push registration error:', JSON.stringify(error));
          setIsRegistered(false);
        });

        // Écouter les notifications reçues (foreground)
        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received (foreground):', notification);
            
            toast({
              title: notification.title || 'Nouvelle notification',
              description: notification.body,
            });
          }
        );

        // Écouter les actions sur les notifications (background/killed)
        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action: ActionPerformed) => {
            console.log('Push notification action performed:', action);
            
            // Gérer la navigation en fonction de la notification
            const data = action.notification.data as Record<string, string>;
            if (data?.route) {
              window.location.href = data.route;
            } else if (data?.type) {
              // Navigation basée sur le type de notification
              switch (data.type) {
                case 'message':
                  window.location.href = data.conversationId 
                    ? `/messages?conversation=${data.conversationId}` 
                    : '/messages';
                  break;
                case 'offer':
                case 'listing':
                case 'like':
                  if (data.listingId) {
                    window.location.href = `/listing/${data.listingId}`;
                  }
                  break;
                case 'payment':
                  window.location.href = '/transactions';
                  break;
                case 'follower':
                  window.location.href = data.userId 
                    ? `/seller/${data.userId}` 
                    : '/profile';
                  break;
                default:
                  break;
              }
            }
          }
        );
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();

    // Cleanup
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [isNative, platform]);

  const unregisterNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Supprimer le token de la base de données
        await supabase
          .from('profiles')
          .update({ push_token: null })
          .eq('id', user.id);
      }

      await PushNotifications.removeAllListeners();
      setIsRegistered(false);
      setPushToken(null);
    } catch (error) {
      console.error('Error unregistering notifications:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isNative) return false;

    try {
      const permission = await PushNotifications.requestPermissions();
      const granted = permission.receive === 'granted';
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (granted && !isRegistered) {
        await PushNotifications.register();
        setIsRegistered(true);
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  return {
    pushToken,
    isRegistered,
    permissionStatus,
    platform,
    isNative,
    unregisterNotifications,
    requestPermission,
  };
};
