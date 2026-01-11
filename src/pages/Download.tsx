import { useEffect, useState } from 'react';
import ayokaLogo from '@/assets/ayoka-logo.png';

type Platform = 'ios' | 'android' | 'desktop';

const Download = () => {
  const [platform, setPlatform] = useState<Platform>('desktop');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(ua) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  const appStoreUrl = 'https://apps.apple.com/app/ayoka/id6756237345';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.ayoka.market';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        {/* Logo */}
        <img 
          src={ayokaLogo} 
          alt="AYOKA" 
          className="w-40 h-40 object-contain"
        />

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Télécharger l'application AYOKA
          </h1>
          <p className="text-muted-foreground">
            Donnez une seconde vie à vos articles, partout autour de vous.
          </p>
        </div>

        {/* Store Badges */}
        <div className="flex flex-col items-center gap-4">
          {/* App Store Badge - Show for iOS or Desktop */}
          {(platform === 'ios' || platform === 'desktop') && (
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img 
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Télécharger sur l'App Store"
                className="h-12"
              />
            </a>
          )}

          {/* Google Play Badge - Show for Android or Desktop */}
          {(platform === 'android' || platform === 'desktop') && (
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <img 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/fr_badge_web_generic.png"
                alt="Disponible sur Google Play"
                className="h-16"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Download;
