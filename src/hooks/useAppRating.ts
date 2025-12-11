import { Capacitor } from '@capacitor/core';

export const useAppRating = () => {
  const openAppStore = () => {
    const platform = Capacitor.getPlatform();
    
    // App IDs
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=app.lovable.fdde6a57c0ea45b0bd6d4e42d3d22471';
    const appStoreUrl = 'https://apps.apple.com/app/ayoka/id6756237345';
    
    let url: string;
    
    if (platform === 'android') {
      // Sur Android, essayer d'ouvrir dans Play Store app
      url = playStoreUrl;
    } else if (platform === 'ios') {
      // Sur iOS, ouvrir dans App Store
      url = appStoreUrl;
    } else {
      // Sur web, détecter le système d'exploitation
      const userAgent = navigator.userAgent.toLowerCase();
      if (/android/i.test(userAgent)) {
        url = playStoreUrl;
      } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        url = appStoreUrl;
      } else {
        // Par défaut, ouvrir Play Store sur desktop
        url = playStoreUrl;
      }
    }
    
    window.open(url, '_blank');
  };

  return { openAppStore };
};
