import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useFavoriteNotifications = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('favorite-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=neq.${userId}`
        },
        async (payload: any) => {
          const { data: listing } = await supabase
            .from('listings')
            .select('id, title, user_id')
            .eq('id', payload.new.listing_id)
            .single();

          if (listing?.user_id === userId) {
            toast("Nouveau favori", {
              description: `Quelqu'un a ajouté "${listing.title}" à ses favoris`,
              action: {
                label: "Voir",
                onClick: () => window.location.href = `/listing/${listing.id}`
              }
            });

            if (Capacitor.isNativePlatform()) {
              await LocalNotifications.schedule({
                notifications: [{
                  title: "Nouveau favori",
                  body: `Quelqu'un a ajouté "${listing.title}" à ses favoris`,
                  id: Date.now(),
                  extra: {
                    type: 'favorite',
                    listingId: listing.id
                  }
                }]
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
};
