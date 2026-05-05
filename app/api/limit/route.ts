import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 服务端专用客户端（service key）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // 注意环境变量名要与你的 .env 一致
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ allowed: false, error: "Missing userId" }, { status: 400 });
    }

    // 检查 Pro 状态
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("is_pro")
      .eq("id", userId)
      .single();

    if (user?.is_pro) {
      return NextResponse.json({ allowed: true });
    }

    // 今日使用次数（UTC 对齐，避免时区偏差）
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

    const { count } = await supabaseAdmin
      .from("comparisons")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString())
      .lt("created_at", tomorrowStart.toISOString());

    const allowed = (count ?? 0) < 5;
    return NextResponse.json({ allowed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ allowed: false, error: message }, { status: 500 });
  }
}