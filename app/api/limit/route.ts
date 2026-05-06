// app/api/limit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // ====== 修改点：从 Authorization 头获取 token，服务端验证用户身份 ======
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!authHeader) {
      return NextResponse.json({ allowed: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(authHeader);
    if (userError || !user) {
      return NextResponse.json({ allowed: false, error: "Invalid token" }, { status: 401 });
    }
    const userId = user.id;
    // ====== 修改点结束 ======

    // 需要 service_role key 来绕过 RLS 查询 users 和 comparisons
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // 检查 Pro 状态
    const { data: proUser } = await supabaseAdmin
      .from("users")
      .select("is_pro")
      .eq("id", userId)
      .single();

    if (proUser?.is_pro) {
      return NextResponse.json({ allowed: true });
    }

    // 今日使用次数
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabaseAdmin
      .from("comparisons")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", today + "T00:00:00")
      .lt("created_at", today + "T23:59:59");

    const allowed = (count ?? 0) < 5;
    return NextResponse.json({ allowed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ allowed: false, error: message }, { status: 500 });
  }
}