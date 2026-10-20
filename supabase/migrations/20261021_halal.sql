-- À exécuter une fois dans Supabase SQL Editor pour une base déjà installée.
-- Ajoute l'information « halal » aux restaurants (non par défaut).

alter table public.restaurants
  add column if not exists halal boolean not null default false;
