import { createClient } from '@supabase/supabase-js'

// Connexion à Supabase.
// Les valeurs viennent du fichier .env (jamais écrites dans le code).
// Vite remplace import.meta.env.VITE_... au moment de la construction.
const url = import.meta.env.VITE_SUPABASE_URL
const cleAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si les clés sont absentes (ou laissées à leur valeur d'exemple),
// l'app passe en "mode démo" : tout est stocké dans le navigateur.
export const supabaseConfigure = Boolean(url && cleAnon && !url.includes('votre-projet'))

export const supabase = supabaseConfigure ? createClient(url, cleAnon) : null
