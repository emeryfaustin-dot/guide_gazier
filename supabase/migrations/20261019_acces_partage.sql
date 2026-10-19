-- À exécuter une fois dans Supabase SQL Editor pour une base déjà installée.
-- Tous les comptes authentifiés partagent désormais les réglages et la gestion des restaurants.

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

drop policy if exists "profil lisible" on public.profils;
create policy "profil lisible" on public.profils
  for select to authenticated using (id = auth.uid());

drop policy if exists "profil modifiable" on public.profils;
create policy "profil modifiable" on public.profils
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "plafonds admin" on public.plafonds;
drop policy if exists "restaurants lisibles" on public.restaurants;
drop policy if exists "restaurants admin modif" on public.restaurants;
drop policy if exists "restaurants admin suppr" on public.restaurants;
drop policy if exists "avis suppr" on public.avis;

alter table public.profils drop column if exists role;
drop function if exists public.est_admin();

drop policy if exists "plafonds lisibles" on public.plafonds;
drop policy if exists "plafonds admin" on public.plafonds;
drop policy if exists "plafonds partages" on public.plafonds;
create policy "plafonds partages" on public.plafonds
  for all to authenticated using (true) with check (true);

drop policy if exists "restaurants lisibles" on public.restaurants;
create policy "restaurants lisibles" on public.restaurants
  for select to authenticated using (true);

drop policy if exists "restaurants proposables" on public.restaurants;
create policy "restaurants proposables" on public.restaurants
  for insert to authenticated with check (true);

drop policy if exists "restaurants admin modif" on public.restaurants;
drop policy if exists "restaurants modifiables collegial" on public.restaurants;
create policy "restaurants modifiables collegial" on public.restaurants
  for update to authenticated using (true) with check (true);

drop policy if exists "restaurants admin suppr" on public.restaurants;
drop policy if exists "restaurants supprimables collegial" on public.restaurants;
create policy "restaurants supprimables collegial" on public.restaurants
  for delete to authenticated using (true);

drop policy if exists "avis suppr" on public.avis;
create policy "avis suppr" on public.avis
  for delete to authenticated using (auteur_id = auth.uid());
