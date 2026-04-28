import { createBrowserClient } from '@supabase/ssr'

// TODO: Replace with generated types once Supabase project is linked:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
