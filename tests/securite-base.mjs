// Test de SÉCURITÉ de la base : exécute supabase/schema.sql dans un PostgreSQL
// embarqué (PGlite), simule Supabase (auth.uid, rôle "authenticated"),
// puis vérifie ce qu'un agent et un admin ont le droit de faire.
// Lancer avec : npm run test:sql
import { PGlite } from '@electric-sql/pglite'
import fs from 'fs'
const db = new PGlite()
// Chemin du dossier supabase/, quel que soit l'endroit d'où on lance la commande
const P = new URL('../supabase/', import.meta.url)
// --- Simulation minimale de Supabase ---
await db.exec(`
create role authenticated nologin; create role anon nologin;
create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema public, auth to authenticated;
grant execute on function auth.uid() to authenticated;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant all on sequences to authenticated;
alter default privileges in schema public grant all on functions to authenticated;
`)
await db.exec(fs.readFileSync(new URL('schema.sql', P),'utf8'))
const U1='11111111-1111-1111-1111-111111111111', U2='22222222-2222-2222-2222-222222222222'
await db.exec(`insert into auth.users values ('${U1}','agent@grtgaz.com','{"prenom":"Julie"}'), ('${U2}','faustin@grtgaz.com','{"prenom":"Faustin"}');
update public.profils set role='admin' where id='${U2}';`)
await db.exec(fs.readFileSync(new URL('donnees-initiales.sql', P),'utf8'))

let ok=0, ko=0
const test = async (nom, fn) => { try { await fn(); console.log('✓', nom); ok++ } catch(e){ console.log('✗', nom, '→', e.message); ko++ } }
const comme = async (uid) => { await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`) }
const val = async (q) => (await db.query(q)).rows
const echoue = async (q, motif) => { try { await db.query(q) } catch(e) { if (!motif || e.message.includes(motif)) return; throw new Error('mauvaise erreur: '+e.message) } throw new Error('aurait dû échouer') }
const assert = (c, m) => { if(!c) throw new Error(m) }

await test('import : 10 restaurants publiés', async () => { const r = await val(`select count(*)::int n from restaurants where statut='valide'`); assert(r[0].n===10, r[0].n) })
await test('profils créés avec prénom', async () => { const r = await val(`select prenom from profils order by prenom`); assert(r.map(x=>x.prenom).join()==='Faustin,Julie', JSON.stringify(r)) })

await comme(U1)
await test('agent : voit les 10 restaurants', async () => { const r = await val(`select count(*)::int n from restaurants`); assert(r[0].n===10, r[0].n) })
await test('agent : proposition forcée en attente', async () => {
  const r = await val(`insert into restaurants (nom,adresse,ville,code_postal,departement,cuisine,prix_moyen,lat,lng,statut) values ('Test','1 rue','Senlis','60300','60','Rapide',30,49.2,2.5,'valide') returning statut, propose_par`)
  assert(r[0].statut==='en_attente' && r[0].propose_par===U1, JSON.stringify(r)) })
await test('agent : refus hors budget', () => echoue(`insert into restaurants (nom,adresse,ville,code_postal,departement,cuisine,prix_moyen,lat,lng) values ('Cher','1 rue','Senlis','60300','60','Français',45,49.2,2.5)`, 'Hors budget'))
await test('agent : refus département sans plafond', () => echoue(`insert into restaurants (nom,adresse,ville,code_postal,departement,cuisine,prix_moyen,lat,lng) values ('Lyon','1 rue','Lyon','69001','69','Autre',10,45,4)`, 'Aucun plafond'))
await test('agent : ne peut pas devenir admin', () => echoue(`update profils set role='admin' where id='${U1}'`, 'permission denied'))
await test('agent : peut changer son prénom', async () => { await db.query(`update profils set prenom='Juju' where id='${U1}'`); const r=await val(`select prenom from profils where id='${U1}'`); assert(r[0].prenom==='Juju') })
await test('agent : ne peut pas modifier les plafonds', async () => { await db.query(`update plafonds set plafond=999 where departement='60'`); const r=await val(`select plafond::int p from plafonds where departement='60'`); assert(r[0].p===40, r[0].p) })
await test('agent : ne peut pas publier un restaurant', async () => { await db.query(`update restaurants set statut='valide' where nom='Test'`); const r=await val(`select statut from restaurants where nom='Test'`); assert(r[0].statut==='en_attente') })
await test('agent : avis avec prénom automatique', async () => { const r=await val(`insert into avis (restaurant_id, auteur_id, prenom, note, commentaire) values (1,'${U1}','Faux',5,'Top') returning prenom, modifie_le`); assert(r[0].prenom==='Juju' && r[0].modifie_le===null, JSON.stringify(r)) })
await test('agent : upsert de son avis', async () => { await db.query(`insert into avis (restaurant_id, auteur_id, note, commentaire) values (1,'${U1}',3,'Bof') on conflict (restaurant_id, auteur_id) do update set note=excluded.note, commentaire=excluded.commentaire`); const r=await val(`select note, modifie_le from avis where restaurant_id=1`); assert(r.length===1 && r[0].note===3 && r[0].modifie_le, JSON.stringify(r)) })
await test('agent : note hors 1-5 refusée', () => echoue(`insert into avis (restaurant_id, auteur_id, note) values (2,'${U1}',6)`))
await test("agent : ne peut pas écrire au nom d'un autre", () => echoue(`insert into avis (restaurant_id, auteur_id, note) values (2,'${U2}',4)`, 'row-level security'))
await test('agent : favori perso OK', async () => { await db.query(`insert into favoris values ('${U1}', 3)`) })
await test("agent : favori d'un autre refusé", () => echoue(`insert into favoris values ('${U2}', 3)`, 'row-level security'))

await comme(U2)
await test('admin : voit la proposition (11 restaurants)', async () => { const r=await val(`select count(*)::int n from restaurants`); assert(r[0].n===11, r[0].n) })
await test('admin : ne voit pas les favoris des autres', async () => { const r=await val(`select count(*)::int n from favoris`); assert(r[0].n===0) })
await test('admin : publie la proposition', async () => { await db.query(`update restaurants set statut='valide' where nom='Test'`); const r=await val(`select statut from restaurants where nom='Test'`); assert(r[0].statut==='valide') })
await test('admin : modifie un plafond', async () => { await db.query(`update plafonds set plafond=42 where departement='60'`); const r=await val(`select plafond::int p from plafonds where departement='60'`); assert(r[0].p===42) })
await test('admin : son ajout est publié directement', async () => { const r=await val(`insert into restaurants (nom,adresse,ville,code_postal,departement,cuisine,prix_moyen,lat,lng,statut) values ('Admin','1 rue','Creil','60100','60','Rapide',12,49.2,2.4,'valide') returning statut`); assert(r[0].statut==='valide') })
await test("admin : supprime l'avis d'un agent", async () => { await db.query(`delete from avis where auteur_id='${U1}'`); const r=await val(`select count(*)::int n from avis`); assert(r[0].n===0) })

await db.exec(`reset role; select set_config('request.jwt.claim.sub','',false);`)
await db.exec(`insert into domaines_autorises values ('grtgaz.com')`)
await test('domaine non autorisé refusé à la création de compte', () => echoue(`insert into auth.users values (gen_random_uuid(),'x@gmail.com','{}')`, 'non autorisée'))
await test('domaine autorisé accepté', async () => { await db.query(`insert into auth.users values (gen_random_uuid(),'y@GRTgaz.com','{}')`) })
console.log(`\n${ok} réussis, ${ko} échoués`)
process.exit(ko ? 1 : 0)
