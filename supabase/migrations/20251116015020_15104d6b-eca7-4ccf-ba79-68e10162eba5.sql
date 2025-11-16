-- Add parent_id to categories table for hierarchical structure
ALTER TABLE public.categories 
ADD COLUMN parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Add index for better performance when querying subcategories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Insert main categories and subcategories
-- First, let's clear existing categories if needed and insert the full hierarchy

-- Électronique
INSERT INTO public.categories (name, slug, icon, parent_id) 
VALUES ('Électronique', 'electronique', 'Smartphone', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Téléphones & Tablettes', 'telephones-tablettes', 'Smartphone', (SELECT id FROM public.categories WHERE slug = 'electronique' AND parent_id IS NULL)),
  ('Ordinateurs', 'ordinateurs', 'Laptop', (SELECT id FROM public.categories WHERE slug = 'electronique' AND parent_id IS NULL)),
  ('TV & Audio', 'tv-audio', 'Tv', (SELECT id FROM public.categories WHERE slug = 'electronique' AND parent_id IS NULL)),
  ('Accessoires électroniques', 'accessoires-electroniques', 'Cable', (SELECT id FROM public.categories WHERE slug = 'electronique' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Mode
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Mode', 'mode', 'Shirt', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Femme', 'mode-femme', 'User', (SELECT id FROM public.categories WHERE slug = 'mode' AND parent_id IS NULL)),
  ('Homme', 'mode-homme', 'UserCheck', (SELECT id FROM public.categories WHERE slug = 'mode' AND parent_id IS NULL)),
  ('Enfants & Bébés', 'mode-enfants-bebes', 'Baby', (SELECT id FROM public.categories WHERE slug = 'mode' AND parent_id IS NULL)),
  ('Accessoires mode', 'accessoires-mode', 'Watch', (SELECT id FROM public.categories WHERE slug = 'mode' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Véhicules
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Véhicules', 'vehicules', 'Car', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Voitures', 'voitures', 'Car', (SELECT id FROM public.categories WHERE slug = 'vehicules' AND parent_id IS NULL)),
  ('Motos & Scooters', 'motos-scooters', 'Bike', (SELECT id FROM public.categories WHERE slug = 'vehicules' AND parent_id IS NULL)),
  ('Pièces & Accessoires', 'pieces-accessoires-auto', 'Wrench', (SELECT id FROM public.categories WHERE slug = 'vehicules' AND parent_id IS NULL)),
  ('Vélos', 'velos', 'Bike', (SELECT id FROM public.categories WHERE slug = 'vehicules' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Maison & Jardin
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Maison & Jardin', 'maison-jardin', 'Home', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Meubles', 'meubles', 'Sofa', (SELECT id FROM public.categories WHERE slug = 'maison-jardin' AND parent_id IS NULL)),
  ('Électroménager', 'electromenager', 'Microwave', (SELECT id FROM public.categories WHERE slug = 'maison-jardin' AND parent_id IS NULL)),
  ('Décoration', 'decoration', 'Lamp', (SELECT id FROM public.categories WHERE slug = 'maison-jardin' AND parent_id IS NULL)),
  ('Jardin', 'jardin', 'TreePine', (SELECT id FROM public.categories WHERE slug = 'maison-jardin' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Loisirs & Divertissement
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Loisirs & Divertissement', 'loisirs', 'Gamepad2', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Sports', 'sports', 'Dumbbell', (SELECT id FROM public.categories WHERE slug = 'loisirs' AND parent_id IS NULL)),
  ('Jeux vidéo', 'jeux-video', 'Gamepad2', (SELECT id FROM public.categories WHERE slug = 'loisirs' AND parent_id IS NULL)),
  ('Livres & Magazines', 'livres-magazines', 'Book', (SELECT id FROM public.categories WHERE slug = 'loisirs' AND parent_id IS NULL)),
  ('Instruments de musique', 'instruments-musique', 'Music', (SELECT id FROM public.categories WHERE slug = 'loisirs' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Immobilier
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Immobilier', 'immobilier', 'Building', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Appartements', 'appartements', 'Building2', (SELECT id FROM public.categories WHERE slug = 'immobilier' AND parent_id IS NULL)),
  ('Maisons', 'maisons', 'Home', (SELECT id FROM public.categories WHERE slug = 'immobilier' AND parent_id IS NULL)),
  ('Terrains', 'terrains', 'Map', (SELECT id FROM public.categories WHERE slug = 'immobilier' AND parent_id IS NULL)),
  ('Bureaux & Commerces', 'bureaux-commerces', 'Store', (SELECT id FROM public.categories WHERE slug = 'immobilier' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Emploi & Services
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Emploi & Services', 'emploi-services', 'Briefcase', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Offres d''emploi', 'offres-emploi', 'FileText', (SELECT id FROM public.categories WHERE slug = 'emploi-services' AND parent_id IS NULL)),
  ('Services à domicile', 'services-domicile', 'Home', (SELECT id FROM public.categories WHERE slug = 'emploi-services' AND parent_id IS NULL)),
  ('Cours & Formations', 'cours-formations', 'GraduationCap', (SELECT id FROM public.categories WHERE slug = 'emploi-services' AND parent_id IS NULL)),
  ('Événements', 'evenements', 'Calendar', (SELECT id FROM public.categories WHERE slug = 'emploi-services' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Animaux
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Animaux', 'animaux', 'PawPrint', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES 
  ('Chiens', 'chiens', 'Dog', (SELECT id FROM public.categories WHERE slug = 'animaux' AND parent_id IS NULL)),
  ('Chats', 'chats', 'Cat', (SELECT id FROM public.categories WHERE slug = 'animaux' AND parent_id IS NULL)),
  ('Accessoires animaux', 'accessoires-animaux', 'Bone', (SELECT id FROM public.categories WHERE slug = 'animaux' AND parent_id IS NULL)),
  ('Autres animaux', 'autres-animaux', 'Bird', (SELECT id FROM public.categories WHERE slug = 'animaux' AND parent_id IS NULL))
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Gratuit (always first)
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Gratuit', 'gratuit', 'Gift', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Autres (always last)
INSERT INTO public.categories (name, slug, icon, parent_id)
VALUES ('Autres', 'autres', 'MoreHorizontal', NULL)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;