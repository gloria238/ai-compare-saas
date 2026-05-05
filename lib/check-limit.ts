import { getSupabase } from "@/lib/supabase";

export async function checkLimit(userId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data: user } = await supabase
    .from("users")
    .select("is_pro")
    .eq("id", userId)
    .single();

  if (user?.is_pro) return true;

  const today = new Date().toISOString().split("T")[0];

  const { count } = await supabase
    .from("comparisons")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", today);

  return (count ?? 0) < 5;
}