import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const ai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://tb.api.mkeai.com/v1",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// 辅助：提取 JSON 字符串
function extractJSON(text: string): string {
  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```/g, "")
    .trim();
  const match = cleaned.match(/(\[[\s\S]*\])|(\{[\s\S]*\})/);
  return match ? match[0].trim() : cleaned;
}

// 将 AI 返回的 products 数组转为 ProductComparison 对象
function buildComparison(products: unknown[]): Record<string, Record<string, string>> | null {
  const result: Record<string, Record<string, string>> = {};
  if (!Array.isArray(products)) return null;

  for (const item of products) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name : null;
    if (!name) continue;

    const features: Record<string, string> = {};
    if (typeof obj.type === "string") features["Type"] = obj.type;
    if (typeof obj.price === "string") features["Price"] = obj.price;
    if (Array.isArray(obj.features)) {
      features["Features"] = obj.features
        .filter((f): f is string => typeof f === "string")
        .join(", ");
    }
    // 其他简单字段
    for (const [key, value] of Object.entries(obj)) {
      if (!["type", "name", "price", "features"].includes(key) && typeof value === "string") {
        features[key] = value;
      }
    }

    result[name] = features;
  }

  return Object.keys(result).length > 0 ? result : null;
}

export async function POST(req: Request) {
  try {
    const { query, userId } = await req.json();
    if (!query || !userId) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    console.log("👉 calling AI...");
    const completion = await ai.chat.completions.create({
      model: "deepseek-v4-flash",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            `You are a product comparison AI. Return a single JSON object with the following structure:
{
  "products": [
    {
      "name": "Product Name",
      "type": "Category (e.g. Flagship Smartphone)",
      "price": "$999",
      "features": ["6.8-inch display", "50MP camera"]
    }
  ],
  "summary": "A short comparative conclusion (1-2 sentences).",
  "winner": "Product Name (optional, only if one is clearly better overall)"
}
No additional text or explanation. Return valid JSON only.`
        },
        { role: "user", content: `Compare: ${query}` }
      ]
    });

    if (!completion.choices || completion.choices.length === 0) {
      return NextResponse.json({ success: false, error: "No valid choices from AI" }, { status: 500 });
    }

    const raw = completion.choices[0]?.message?.content || "";
    if (typeof raw === "string" && raw.startsWith("<!doctype")) {
      throw new Error("AI returned HTML. Check baseURL or API key.");
    }

    // 解析 JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const extracted = extractJSON(raw);
      try {
        parsed = JSON.parse(extracted);
      } catch {
        // 完全无法解析，返回原始文本
        await supabase.from("comparisons").insert([{
          user_id: userId,
          items: query,
          criteria: "AI",
          result: { raw }
        }]);
        return NextResponse.json({ success: true, data: { raw } });
      }
    }

    // 提取 summary 和 winner
    const summary = typeof (parsed as Record<string, unknown>)?.summary === "string"
      ? (parsed as Record<string, unknown>).summary as string
      : undefined;
    const winner = typeof (parsed as Record<string, unknown>)?.winner === "string"
      ? (parsed as Record<string, unknown>).winner as string
      : undefined;

    // 提取 products 并转换为 comparison
    const products = (parsed as Record<string, unknown>)?.products;
    const comparison = buildComparison(products as unknown[]);

    if (!comparison) {
      // products 缺失，也降级为 raw
      await supabase.from("comparisons").insert([{
        user_id: userId,
        items: query,
        criteria: "AI",
        result: { raw }
      }]);
      return NextResponse.json({ success: true, data: { raw } });
    }

    const result = { comparison, summary, winner };

    // 存入数据库（只存结构化部分）
    await supabase.from("comparisons").insert([{
      user_id: userId,
      items: query,
      criteria: "AI",
      result: result as unknown as Record<string, unknown>,
    }]);

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}