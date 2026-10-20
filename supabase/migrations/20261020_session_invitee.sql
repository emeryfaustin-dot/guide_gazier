-- À exécuter une fois dans Supabase SQL Editor pour une base déjà installée.
-- Les visiteurs utilisent une session invitée créée automatiquement, sans email.

alter table public.profils alter column email drop not null;

create or replace function public.creer_profil()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.email is not null
     and exists (select 1 from public.domaines_autorises)
     and not exists (select 1 from public.domaines_autorises
                     where lower(split_part(new.email, '@', 2)) = lower(domaine)) then
    raise exception 'Adresse email non autorisée pour cette application.';
  end if;

  insert into public.profils (id, email, prenom)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'prenom', ''));
  return new;
end;
$$;