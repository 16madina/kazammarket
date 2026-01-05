-- Table pour stocker les logs de modération d'images
CREATE TABLE public.image_moderation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  is_safe BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_image_moderation_logs_created_at ON public.image_moderation_logs(created_at DESC);
CREATE INDEX idx_image_moderation_logs_is_safe ON public.image_moderation_logs(is_safe);
CREATE INDEX idx_image_moderation_logs_user_id ON public.image_moderation_logs(user_id);

-- Enable RLS
ALTER TABLE public.image_moderation_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les logs de modération
CREATE POLICY "Admins can view moderation logs"
ON public.image_moderation_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- L'edge function peut insérer (via service role)
CREATE POLICY "Service role can insert moderation logs"
ON public.image_moderation_logs
FOR INSERT
WITH CHECK (true);