import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

export const getAdminSupabase = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY! // 👈 用这个
  )
}