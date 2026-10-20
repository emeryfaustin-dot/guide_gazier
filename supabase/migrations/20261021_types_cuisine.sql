-- À exécuter une fois dans Supabase SQL Editor pour une base déjà installée.
-- Ajoute les types de restaurant configurables et leurs logos/couleurs.

create table if not exists public.types_cuisine (
  nom     text primary key check (char_length(nom) between 1 and 40),
  couleur text not null check (couleur ~ '^#[0-9A-Fa-f]{6}$'),
  icone   text not null check (icone in ('vin', 'bol', 'burger', 'poisson', 'pizza', 'couverts'))
);
grant select, insert, update, delete on public.types_cuisine to authenticated;

insert into public.types_cuisine (nom, couleur, icone) values
  ('Rapide', '#e8a317', 'burger'),
  ('Français', '#7a2638', 'vin'),
  ('Japonais', '#23395b', 'bol'),
  ('Portugais', '#1d6f86', 'poisson'),
  ('Italien', '#2f7a4d', 'pizza'),
  ('Autre', '#5c4f86', 'couverts')
on conflict (nom) do nothing;

insert into public.types_cuisine (nom, couleur, icone)
select distinct cuisine, '#5c4f86', 'couverts' from public.restaurants
on conflict (nom) do nothing;

alter table public.restaurants drop constraint if exists restaurants_cuisine_fkey;
alter table public.restaurants
  add constraint restaurants_cuisine_fkey
  foreign key (cuisine) references public.types_cuisine (nom)
  on update cascade on delete restrict;

alter table public.types_cuisine enable row level security;
drop policy if exists "types cuisine partages" on public.types_cuisine;
create policy "types cuisine partages" on public.types_cuisine
  for all to authenticated using (true) with check (true);