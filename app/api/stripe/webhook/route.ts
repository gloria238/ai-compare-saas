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

    console.log("✅ checkout.session.completed fired");
    console.log("Session ID:", session.id);
    console.log("Metadata userId:", userId);

    if (!userId) {
      console.error("❌ No userId found in metadata");
      return NextResponse.json({ error: "No userId" }, { status: 400 });
    }

    // 检查用户是否存在
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Error fetching user:", fetchError);
    }

    if (!existingUser) {
      // 用户不存在：直接插入并标记为 Pro
      console.log("⚠️ User record not found, inserting with is_pro = true");
      const { error: insertError } = await supabaseAdmin
        .from("users")
        .insert({ id: userId, is_pro: true });

      if (insertError) {
        console.error("❌ Failed to insert user:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      console.log("🎉 Inserted new user with Pro status");
    } else {
      // 用户存在：更新 is_pro
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({ is_pro: true })
        .eq("id", userId);

      if (updateError) {
        console.error("❌ Failed to update user:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      console.log("🎉 Updated user to Pro:", userId);
    }
  }

  return NextResponse.json({ received: true });
}