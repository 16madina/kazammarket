import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface ShareData {
  title?: string;
  text?: string;
  url: string;
}

export const useNativeShare = () => {
  const share = async (data: ShareData): Promise<boolean> => {
    const { title, text, url } = data;
    
    // On native platforms, use Capacitor Share plugin
    if (Capacitor.isNativePlatform()) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: title || 'AYOKA MARKET',
          text: text || '',
          url: url,
          dialogTitle: title || 'Partager',
        });
        return true;
      } catch (error: any) {
        // User cancelled sharing
        if (error.message?.includes('cancel') || error.message?.includes('dismiss')) {
          return false;
        }
        console.error('Native share error:', error);
        // Fallback to clipboard
        await copyToClipboard(url);
        return false;
      }
    }
    
    // On web, try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        return true;
      } catch (error: any) {
        // User cancelled
        if (error.name === 'AbortError') {
          return false;
        }
        console.error('Web share error:', error);
      }
    }
    
    // Final fallback: copy to clipboard
    await copyToClipboard(url);
    return false;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Lien copié dans le presse-papier !');
    } catch (error) {
      console.error('Clipboard error:', error);
      toast.error('Impossible de copier le lien');
    }
  };

  return { share, copyToClipboard };
};
