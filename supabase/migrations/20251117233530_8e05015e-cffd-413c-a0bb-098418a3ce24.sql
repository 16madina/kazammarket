
-- Ajouter une politique RLS pour permettre aux receivers de marquer les messages comme lus
CREATE POLICY "Receivers can mark messages as read"
ON public.messages
FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);
