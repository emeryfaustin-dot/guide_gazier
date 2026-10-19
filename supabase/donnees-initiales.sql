-- =====================================================================
--  Données de départ : plafonds + les 10 restaurants de démonstration.
--  À exécuter APRÈS schema.sql (SQL Editor > New query > Run).
--  Tu peux sauter les restaurants si tu veux partir d'une base vide.
-- =====================================================================

insert into public.plafonds (departement, nom, plafond) values
  ('60', 'Oise', 40),
  ('75', 'Paris', 45),
  ('77', 'Seine-et-Marne', 38),
  ('93', 'Seine-Saint-Denis', 35),
  ('95', 'Val-d''Oise', 38)
on conflict (departement) do update set nom = excluded.nom, plafond = excluded.plafond;

-- Le trigger de budget refuserait "Le Grand Cerf" (48 € > 40 €) : on le désactive
-- le temps de l'import pour garder un exemple "hors budget" visible.
alter table public.restaurants disable trigger avant_ajout_restaurant;

insert into public.restaurants
  (nom, adresse, ville, code_postal, departement, cuisine, prix_moyen, telephone, horaires, lat, lng, statut)
values
  ('Le Relais du Poste', '12 rue de Chantilly', 'Lamorlaye', '60260', '60', 'Français', 28, '03 44 00 00 01', 'Lun–Ven 12h–14h30, 19h–22h', 49.1569, 2.4413, 'valide'),
  ('Sakura Express', '5 avenue du Maréchal Joffre', 'Chantilly', '60500', '60', 'Japonais', 22, '03 44 00 00 02', 'Lun–Sam 11h30–14h30, 18h30–22h', 49.1944, 2.4711, 'valide'),
  ('La Table du Chancelier', '3 place de la Cathédrale', 'Senlis', '60300', '60', 'Français', 38, '03 44 00 00 03', 'Lun–Ven 12h–14h30, 19h–22h', 49.2069, 2.5866, 'valide'),
  ('Burger de l''Oise', '18 rue de la République', 'Creil', '60100', '60', 'Rapide', 14, '03 44 00 00 04', 'Tous les jours 11h–23h', 49.2597, 2.475, 'valide'),
  ('Le Grand Cerf', '9 rue Solférino', 'Compiègne', '60200', '60', 'Français', 48, '03 44 00 00 05', 'Lun–Ven 12h–14h30, 19h–22h', 49.4179, 2.8261, 'valide'),
  ('O Cantinho', '27 avenue de Rosny', 'Villemomble', '93250', '93', 'Portugais', 19, '01 48 00 00 06', 'Lun–Sam 12h–15h', 48.8833, 2.5089, 'valide'),
  ('Trattoria Bella Vita', '40 rue du Général Leclerc', 'Rosny-sous-Bois', '93110', '93', 'Italien', 24, '01 48 00 00 07', 'Mar–Dim 12h–14h30, 19h–23h', 48.8747, 2.4859, 'valide'),
  ('Chez Gaston', '15 rue de Charenton', 'Paris', '75012', '75', 'Français', 42, '01 43 00 00 08', 'Lun–Ven 12h–14h30, 19h–22h', 48.8412, 2.3876, 'valide'),
  ('Pizzeria du Marché', '6 rue du Grand Cerf', 'Meaux', '77100', '77', 'Italien', 18, '01 64 00 00 09', 'Mar–Dim 12h–14h30, 19h–23h', 48.9601, 2.8788, 'valide'),
  ('Le Comptoir Libanais', '2 boulevard de l''Oise', 'Cergy', '95000', '95', 'Autre', 17, '01 34 00 00 10', 'Lun–Sam 11h30–15h', 49.0364, 2.0761, 'valide');

alter table public.restaurants enable trigger avant_ajout_restaurant;

-- (Optionnel) Réserver l'app aux emails GRTgaz :
--
--   insert into public.domaines_autorises (domaine) values ('grtgaz.com');
-- ---------------------------------------------------------------------
