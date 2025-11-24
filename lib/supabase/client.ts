import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Create client only if it doesn't exist and we're in browser
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in browser environment')
  }

  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseClient = createBrowserClient(url, key)
  }

  return supabaseClient
}
