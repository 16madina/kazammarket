import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MessageReactionsProps {
  messageId: string;
  userId: string;
}

const EMOJIS = ['👍', '❤️', '😂', '👎'];

export const MessageReactions = ({ messageId, userId }: MessageReactionsProps) => {
  const queryClient = useQueryClient();

  const { data: reactions = [] } = useQuery({
    queryKey: ["message-reactions", messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_reactions")
        .select("*")
        .eq("message_id", messageId);

      if (error) throw error;
      return data || [];
    },
  });

  const addReaction = useMutation({
    mutationFn: async (emoji: string) => {
      const { error } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: userId,
          emoji,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-reactions", messageId] });
    },
  });

  const removeReaction = useMutation({
    mutationFn: async (emoji: string) => {
      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", userId)
        .eq("emoji", emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-reactions", messageId] });
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`reactions:${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["message-reactions", messageId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId, queryClient]);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, userIds: [] };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].userIds.push(reaction.user_id);
    return acc;
  }, {} as Record<string, { count: number; userIds: string[] }>);

  const handleReactionClick = (emoji: string) => {
    const userReacted = groupedReactions[emoji]?.userIds.includes(userId);
    if (userReacted) {
      removeReaction.mutate(emoji);
    } else {
      addReaction.mutate(emoji);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {Object.keys(groupedReactions).length > 0 && (
        <div className="flex gap-1">
          {Object.entries(groupedReactions).map(([emoji, data]) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-xs ${
                data.userIds.includes(userId) ? "bg-primary/10" : ""
              }`}
              onClick={() => handleReactionClick(emoji)}
            >
              {emoji} {data.count}
            </Button>
          ))}
        </div>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            +
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => handleReactionClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
