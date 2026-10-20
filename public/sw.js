// Service worker minimal : il rend l'app « installable » sur le téléphone.
// Il ne met rien en cache : chaque requête part normalement sur le réseau,
// donc les données (Supabase, Google) sont toujours à jour.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (evenement) => evenement.waitUntil(self.clients.claim()))
// Écouteur vide : le navigateur traite la requête comme d'habitude.
self.addEventListener('fetch', () => {})
