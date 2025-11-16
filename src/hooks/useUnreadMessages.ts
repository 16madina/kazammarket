import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

interface UnreadMessage {
  conversation_id: string;
  count: number;
  sender_name: string;
  listing_title: string;
}

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (!conversations) return;

      const conversationIds = conversations.map(c => c.id);
      
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          setUnreadCount(prev => prev + 1);

          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
              *,
              listing:listing_id(title, currency),
              buyer:profiles!conversations_buyer_id_fkey(full_name),
              seller:profiles!conversations_seller_id_fkey(full_name)
            `)
            .eq('id', newMessage.conversation_id)
            .single();

          if (conversation) {
            const senderName = conversation.buyer_id === newMessage.sender_id 
              ? conversation.buyer?.full_name 
              : conversation.seller?.full_name;

            let notificationTitle = '';
            let notificationBody = '';

            if (newMessage.message_type === 'text') {
              notificationTitle = `Nouveau message de ${senderName}`;
              notificationBody = newMessage.content.length > 50 
                ? newMessage.content.substring(0, 50) + '...' 
                : newMessage.content;
            } else if (newMessage.message_type === 'image') {
              notificationTitle = `${senderName} a partagé une image`;
              notificationBody = conversation.listing?.title || 'Image partagée';
            } else if (newMessage.message_type === 'location') {
              notificationTitle = `${senderName} a partagé une position`;
              notificationBody = newMessage.location_name || 'Position partagée';
            }

            toast(notificationTitle, {
              description: notificationBody,
              action: {
                label: "Voir",
                onClick: () => window.location.href = `/messages?conversation=${newMessage.conversation_id}`
              }
            });

            if (Capacitor.isNativePlatform()) {
              await LocalNotifications.schedule({
                notifications: [{
                  title: notificationTitle,
                  body: notificationBody,
                  id: Date.now(),
                  extra: {
                    type: 'message',
                    conversationId: newMessage.conversation_id
                  }
                }]
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'price_offers',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const offer = payload.new as any;
          
          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
              *,
              listing:listing_id(title, price, currency),
              buyer:profiles!conversations_buyer_id_fkey(full_name),
              seller:profiles!conversations_seller_id_fkey(full_name)
            `)
            .eq('id', offer.conversation_id)
            .single();

          if (conversation) {
            const listing = conversation.listing;
            const notificationTitle = "Nouvelle offre de prix";
            const notificationBody = `Offre de ${offer.amount} ${listing?.currency || 'FCFA'} reçue`;

            toast(notificationTitle, {
              description: notificationBody,
              action: {
                label: "Voir",
                onClick: () => window.location.href = `/messages?conversation=${offer.conversation_id}`
              }
            });

            if (Capacitor.isNativePlatform()) {
              await LocalNotifications.schedule({
                notifications: [{
                  title: notificationTitle,
                  body: notificationBody,
                  id: Date.now(),
                  extra: {
                    type: 'message',
                    conversationId: offer.conversation_id
                  }
                }]
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markConversationAsRead = async (conversationId: string) => {
    if (!userId) return;

    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (messages && messages.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      setUnreadCount(prev => Math.max(0, prev - messages.length));
    }
  };

  return { unreadCount, markConversationAsRead };
};
