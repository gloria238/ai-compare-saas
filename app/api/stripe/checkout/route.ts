import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    // 🔥 临时强制使用线上域名，确保支付后正确跳转
    const baseUrl = "https://ai-compare-saas.vercel.app";
    // 等环境变量问题彻底解决后，可恢复为：
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI Compare Pro",
              description: "Unlimited comparisons, priority AI, early features",
            },
            unit_amount: 990,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: `${baseUrl}/dashboard?pro=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?pro=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}