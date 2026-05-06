// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("❌ Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    console.log("✅ checkout.session.completed fired, userId:", userId);

    if (!userId) {
      console.error("❌ No userId found");
      return NextResponse.json({ error: "No userId" }, { status: 400 });
    }

    // ++++++++++ 幂等性检查 ++++++++++
    // 1. 先查询该用户是否已处理过这个 session
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id, stripe_session_id")
      .eq("id", userId)
      .maybeSingle();

    if (existingUser?.stripe_session_id === session.id) {
      // 已经处理过此 session，直接返回成功（幂等）
      console.log("⏩ Session already processed, skipping");
      return NextResponse.json({ received: true });
    }
    // ++++++++++ 检查结束 ++++++++++

    // 如果用户记录不存在，插入；存在则更新 is_pro 并记录 session id
    if (!existingUser) {
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          id: userId,
          is_pro: true,
          stripe_session_id: session.id,  // 新增：记录 session id
        });
      if (insertError) {
        console.error("❌ Failed to insert user:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      console.log("🎉 New user inserted with Pro status, session:", session.id);
    } else {
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          is_pro: true,
          stripe_session_id: session.id,  // 更新 session id
        })
        .eq("id", userId);
      if (updateError) {
        console.error("❌ Failed to update user:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      console.log("🎉 User upgraded to Pro, session:", session.id);
    }
  }

  return NextResponse.json({ received: true });
}