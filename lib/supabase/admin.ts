import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Service role client — bypasses RLS
// ONLY use in trusted server-side contexts (Route Handlers, Edge Functions)
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
