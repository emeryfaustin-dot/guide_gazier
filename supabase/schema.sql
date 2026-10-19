-- =====================================================================
--  Guide du gazier — schéma de la base Supabase (PostgreSQL)
--
--  À exécuter UNE FOIS dans Supabase : menu "SQL Editor" > "New query",
--  coller tout ce fichier, puis "Run".
--
--  Contenu :
--   1. Tables (profils, plafonds, restaurants, favoris, avis, domaines_autorises)
--   2. Fonctions et triggers (création de profil, contrôle du budget, prénom des avis)
--   3. Sécurité RLS (qui peut lire / écrire quoi)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

-- Profil de chaque collègue (créé automatiquement à la 1re connexion).
create table if not exists public.profils (
  id      uuid primary key references auth.users (id) on delete cascade,
  email   text not null,
  prenom  text not null default '',
  cree_le timestamptz not null default now()
);

-- Table de configuration des plafonds de budget par département.
create table if not exists public.plafonds (
  departement text primary key,                 -- ex : '60'
  nom         text not null,                    -- ex : 'Oise'
  plafond     numeric(6, 2) not null check (plafond > 0) -- en € par personne
);

-- Restaurants.
-- Pour Google : on garde surtout place_id ; téléphone, horaires, site et photo
-- sont relus en direct chez Google à l'ouverture de la fiche (voir /api).
create table if not exists public.restaurants (
  id           bigint generated always as identity primary key,
  nom          text not null,
  adresse      text not null,
  ville        text not null,
  code_postal  text not null,
  departement  text not null,
  cuisine      text not null,
  prix_moyen   numeric(6, 2) not null check (prix_moyen > 0),
  telephone    text,               -- rempli seulement en saisie manuelle
  horaires     text,               -- idem
  site_web     text,               -- idem
  lat          double precision not null,
  lng          double precision not null,
  place_id     text unique,        -- identifiant Google Places (peut être conservé)
  statut       text not null default 'en_attente' check (statut in ('en_attente', 'valide', 'refuse')),
  propose_par  uuid references public.profils (id) on delete set null,
  cree_le      timestamptz not null default now()
);

-- Favoris : une ligne = "tel collègue a mis tel restaurant en favori".
create table if not exists public.favoris (
  utilisateur_id uuid   not null references public.profils (id) on delete cascade,
  restaurant_id  bigint not null references public.restaurants (id) on delete cascade,
  cree_le        timestamptz not null default now(),
  primary key (utilisateur_id, restaurant_id)
);

-- Avis : note de 1 à 5 + commentaire. Un seul avis par personne et par restaurant.
create table if not exists public.avis (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id bigint not null references public.restaurants (id) on delete cascade,
  auteur_id     uuid   not null references public.profils (id) on delete cascade,
  prenom        text   not null default '',
  note          smallint not null check (note between 1 and 5),
  commentaire   text not null default '' check (char_length(commentaire) <= 1000),
  cree_le       timestamptz not null default now(),
  modifie_le    timestamptz,
  unique (restaurant_id, auteur_id)
);

-- (Optionnel) Domaines email autorisés à créer un compte, ex : 'grtgaz.com'.
-- Table vide = tout le monde peut se connecter.
create table if not exists public.domaines_autorises (
  domaine text primary key
);


-- ---------------------------------------------------------------------
-- 2. FONCTIONS ET TRIGGERS
-- ---------------------------------------------------------------------

-- À la création d'un compte : vérifie le domaine email et crée le profil.
create or replace function public.creer_profil()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if exists (select 1 from public.domaines_autorises)
     and not exists (select 1 from public.domaines_autorises
                     where lower(split_part(new.email, '@', 2)) = lower(domaine)) then
    raise exception 'Adresse email non autorisée pour cette application.';
  end if;

  insert into public.profils (id, email, prenom)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'prenom', ''));
  return new;
end;
$$;

drop trigger if exists apres_creation_utilisateur on auth.users;
create trigger apres_creation_utilisateur
  after insert on auth.users
  for each row execute function public.creer_profil();

-- Contrôle du budget AVANT l'ajout d'un restaurant (règle métier côté serveur).
create or replace function public.controler_budget()
returns trigger
language plpgsql
as $$
declare
  limite numeric;
begin
  select plafond into limite from public.plafonds where departement = new.departement;
  if limite is null then
    raise exception 'Aucun plafond défini pour le département %', new.departement;
  end if;
  if new.prix_moyen > limite then
    raise exception 'Hors budget : % € dépasse le plafond de % € (département %)',
      new.prix_moyen, limite, new.departement;
  end if;
  return new;
end;
$$;

drop trigger if exists avant_ajout_restaurant on public.restaurants;
create trigger avant_ajout_restaurant
  before insert on public.restaurants
  for each row execute function public.controler_budget();

-- Chaque collègue propose un restaurant en attente, à son nom.
create or replace function public.forcer_statut_proposition()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    new.statut := 'en_attente';
    new.propose_par := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists avant_ajout_restaurant_statut on public.restaurants;
create trigger avant_ajout_restaurant_statut
  before insert on public.restaurants
  for each row execute function public.forcer_statut_proposition();

-- Le prénom affiché sur un avis est toujours celui du profil (impossible de tricher),
-- et la date de modification est gérée par la base (seulement lors d'une mise à jour).
create or replace function public.remplir_prenom_avis()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  select prenom into new.prenom from public.profils where id = new.auteur_id;
  if tg_op = 'UPDATE' then
    new.modifie_le := now();
    new.cree_le := old.cree_le;
  else
    new.modifie_le := null;
  end if;
  return new;
end;
$$;

drop trigger if exists avant_ecriture_avis on public.avis;
create trigger avant_ecriture_avis
  before insert or update on public.avis
  for each row execute function public.remplir_prenom_avis();

-- Quand un collègue change son prénom, ses avis suivent.
create or replace function public.propager_prenom()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.avis set prenom = new.prenom where auteur_id = new.id;
  return new;
end;
$$;

drop trigger if exists apres_maj_prenom on public.profils;
create trigger apres_maj_prenom
  after update of prenom on public.profils
  for each row execute function public.propager_prenom();


-- ---------------------------------------------------------------------
-- 3. SÉCURITÉ : ROW LEVEL SECURITY (RLS)
--    Sans règle explicite, tout est interdit. On autorise au cas par cas.
-- ---------------------------------------------------------------------

alter table public.profils            enable row level security;
alter table public.plafonds           enable row level security;
alter table public.restaurants        enable row level security;
alter table public.favoris            enable row level security;
alter table public.avis               enable row level security;
alter table public.domaines_autorises enable row level security;

-- PROFILS : chacun voit et modifie uniquement son prénom.
drop policy if exists "profil lisible" on public.profils;
create policy "profil lisible" on public.profils
  for select to authenticated using (id = auth.uid());

drop policy if exists "profil modifiable" on public.profils;
create policy "profil modifiable" on public.profils
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Le profil ne peut modifier que son prénom.
revoke update on public.profils from authenticated;
grant update (prenom) on public.profils to authenticated;

-- PLAFONDS : lecture et configuration partagées par les collègues connectés.
drop policy if exists "plafonds lisibles" on public.plafonds;
drop policy if exists "plafonds admin" on public.plafonds;
drop policy if exists "plafonds partages" on public.plafonds;
create policy "plafonds partages" on public.plafonds
  for all to authenticated using (true) with check (true);

-- RESTAURANTS : tout collègue connecté peut consulter et gérer la publication.
drop policy if exists "restaurants lisibles" on public.restaurants;
create policy "restaurants lisibles" on public.restaurants
  for select to authenticated
  using (true);

drop policy if exists "restaurants proposables" on public.restaurants;
create policy "restaurants proposables" on public.restaurants
  for insert to authenticated with check (true); -- statut forcé par trigger

drop policy if exists "restaurants admin modif" on public.restaurants;
drop policy if exists "restaurants modifiables collegial" on public.restaurants;
create policy "restaurants modifiables collegial" on public.restaurants
  for update to authenticated using (true) with check (true);

drop policy if exists "restaurants admin suppr" on public.restaurants;
drop policy if exists "restaurants supprimables collegial" on public.restaurants;
create policy "restaurants supprimables collegial" on public.restaurants
  for delete to authenticated using (true);

-- FAVORIS : chacun ne gère que les siens.
drop policy if exists "favoris perso" on public.favoris;
create policy "favoris perso" on public.favoris
  for all to authenticated
  using (utilisateur_id = auth.uid()) with check (utilisateur_id = auth.uid());

-- AVIS : lisibles par tous les connectés ; chacun écrit, modifie et supprime les siens.
drop policy if exists "avis lisibles" on public.avis;
create policy "avis lisibles" on public.avis
  for select to authenticated using (true);

drop policy if exists "avis ajout" on public.avis;
create policy "avis ajout" on public.avis
  for insert to authenticated with check (auteur_id = auth.uid());

drop policy if exists "avis modif" on public.avis;
create policy "avis modif" on public.avis
  for update to authenticated using (auteur_id = auth.uid()) with check (auteur_id = auth.uid());

drop policy if exists "avis suppr" on public.avis;
create policy "avis suppr" on public.avis
  for delete to authenticated using (auteur_id = auth.uid());

-- DOMAINES AUTORISÉS : gérés uniquement depuis le tableau de bord Supabase (aucune règle = aucun accès depuis l'app).
