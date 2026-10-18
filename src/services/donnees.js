// Point d'accès unique aux données pour toute l'application.
// Les composants n'importent QUE ce fichier : ils ne savent pas
// si les données viennent de Supabase ou du mode démo.

import { supabaseConfigure } from '../lib/supabase.js'
import { serviceSupabase } from './serviceSupabase.js'
import { serviceDemo } from './serviceDemo.js'

export const service = supabaseConfigure ? serviceSupabase : serviceDemo
