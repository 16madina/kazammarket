import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NotificationType } from '@/types/notifications';

interface NativePushNotificationsState {
  token: string | null;
  isRegistered: boolean;
  isLoading: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
}

export const useNativePushNotifications = () => {
  const [state, setState] = useState<NativePushNotificationsState>({
    token: null,
    isRegistered: false,
    isLoading: false,
    permissionStatus: 'prompt'
  });

  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  // Check if push notifications are supported
  const isSupported = useCallback(() => {
    return isNative && (platform === 'ios' || platform === 'android');
  }, [isNative, platform]);

  // Request permission for push notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) {
      console.log('Push notifications not supported on this platform');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Check current permission status
      const permStatus = await PushNotifications.checkPermissions();
      console.log('Current permission status:', permStatus);

      if (permStatus.receive === 'granted') {
        setState(prev => ({ ...prev, permissionStatus: 'granted' }));
        await registerForPushNotifications();
        return true;
      }

      if (permStatus.receive === 'denied') {
        setState(prev => ({ 
          ...prev, 
          permissionStatus: 'denied',
          isLoading: false 
        }));
        toast({
          title: 'Notifications désactivées',
          description: 'Activez les notifications dans les réglages de votre appareil',
          variant: 'destructive'
        });
        return false;
      }

      // Request permission
      const permission = await PushNotifications.requestPermissions();
      console.log('Permission request result:', permission);

      if (permission.receive === 'granted') {
        setState(prev => ({ ...prev, permissionStatus: 'granted' }));
        await registerForPushNotifications();
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          permissionStatus: 'denied',
          isLoading: false 
        }));
        return false;
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [isSupported]);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    try {
      await PushNotifications.register();
      console.log('Push notifications registration initiated');
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Save token to database
  const saveTokenToDatabase = useCallback(async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, token not saved');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          push_token: token,
          // Store platform info for proper notification routing
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully for platform:', platform);
      }
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  }, [platform]);

  // Remove token from database
  const removeToken = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ push_token: null })
        .eq('id', user.id);

      await PushNotifications.removeAllListeners();
      
      setState(prev => ({
        ...prev,
        token: null,
        isRegistered: false
      }));

      console.log('Push token removed');
    } catch (error) {
      console.error('Error removing push token:', error);
    }
  }, []);

  // Handle notification navigation
  const handleNotificationNavigation = useCallback((data: Record<string, string>) => {
    const type = data?.type as NotificationType;
    let route = '/';

    switch (type) {
      case 'message':
        route = data?.conversationId 
          ? `/messages?conversation=${data.conversationId}` 
          : '/messages';
        break;
      case 'offer':
        route = data?.listingId 
          ? `/listing/${data.listingId}` 
          : '/messages';
        break;
      case 'promo':
      case 'like':
      case 'listing':
        route = data?.listingId 
          ? `/listing/${data.listingId}` 
          : '/';
        break;
      case 'payment':
        route = '/transactions';
        break;
      case 'follower':
        route = data?.userId 
          ? `/seller/${data.userId}` 
          : '/profile';
        break;
      case 'review':
        route = '/profile';
        break;
      default:
        route = data?.route || '/';
    }

    // Navigate using window.location for Capacitor apps
    if (route !== window.location.pathname) {
      window.location.href = route;
    }
  }, []);

  // Initialize push notifications
  useEffect(() => {
    if (!isSupported()) {
      setState(prev => ({ ...prev, permissionStatus: 'unsupported' }));
      return;
    }

    let isSubscribed = true;

    const setupListeners = async () => {
      // Registration success listener
      await PushNotifications.addListener('registration', async (token: Token) => {
        if (!isSubscribed) return;
        
        console.log('Push registration success:', token.value);
        
        setState(prev => ({
          ...prev,
          token: token.value,
          isRegistered: true,
          isLoading: false
        }));

        await saveTokenToDatabase(token.value);
      });

      // Registration error listener
      await PushNotifications.addListener('registrationError', (error: any) => {
        if (!isSubscribed) return;
        
        console.error('Push registration error:', error);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRegistered: false
        }));

        toast({
          title: 'Erreur d\'enregistrement',
          description: 'Impossible d\'activer les notifications push',
          variant: 'destructive'
        });
      });

      // Notification received (foreground)
      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          if (!isSubscribed) return;
          
          console.log('Push notification received (foreground):', notification);

          // Show toast for foreground notifications
          toast({
            title: notification.title || 'AYOKA MARKET',
            description: notification.body || ''
          });
        }
      );

      // Notification action performed (background/killed)
      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
          if (!isSubscribed) return;
          
          console.log('Push notification action performed:', action);

          const data = action.notification.data as Record<string, string>;
          handleNotificationNavigation(data);
        }
      );

      // Check initial permission status
      const permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'granted') {
        setState(prev => ({ ...prev, permissionStatus: 'granted' }));
        // Auto-register if permission already granted
        await registerForPushNotifications();
      } else if (permStatus.receive === 'denied') {
        setState(prev => ({ ...prev, permissionStatus: 'denied' }));
      }
    };

    setupListeners();

    // Cleanup
    return () => {
      isSubscribed = false;
      PushNotifications.removeAllListeners();
    };
  }, [isSupported, saveTokenToDatabase, handleNotificationNavigation, registerForPushNotifications]);

  return {
    ...state,
    isSupported: isSupported(),
    platform,
    requestPermission,
    removeToken
  };
};
