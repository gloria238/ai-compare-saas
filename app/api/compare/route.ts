// app/api/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import type { StructuredResult } from "@/types/ai";

// DeepSeek v4 配置
const ai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://tb.api.mkeai.com/v1",
});

// Supabase 服务端客户端（用于存储数据，使用 service key）
const supabaseAdmin = createClient(
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
    for (const [key, value] of Object.entries(obj)) {
      if (!["type", "name", "price", "features"].includes(key) && typeof value === "string") {
        features[key] = value;
      }
    }

    result[name] = features;
  }

  return Object.keys(result).length > 0 ? result : null;
}

// ========= 关键修改：parseAndConvert 现在能处理新格式 =========
function parseAndConvert(text: string): StructuredResult | { raw: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const extracted = extractJSON(text);
    try {
      parsed = JSON.parse(extracted);
    } catch {
      return { raw: text };
    }
  }

  // 新格式：{ products: [...], summary?: string, winner?: string }
  if (typeof parsed === "object" && parsed !== null && "products" in parsed) {
    const obj = parsed as { products: unknown[]; summary?: unknown; winner?: unknown };
    const comparison = buildComparison(obj.products);
    if (comparison) {
      const summary = typeof obj.summary === "string" ? obj.summary : undefined;
      const winner = typeof obj.winner === "string" ? obj.winner : undefined;
      return { comparison, summary, winner };
    }
    // 如果 products 无法解析，返回 raw
    return { raw: text };
  }

  // 旧格式：纯数组（AI 直接返回数组）
  if (Array.isArray(parsed)) {
    const comparison = buildComparison(parsed);
    if (comparison) return { comparison }; // 没有 summary/winner
  }

  // 旧格式：普通对象（可能是直接的产品对比对象，可能是旧版 ProductComparison）
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    // 检查是否像 StructuredResult（有 comparison 字段）
    if ("comparison" in parsed) {
      const obj = parsed as { comparison: Record<string, Record<string, string>>; summary?: unknown; winner?: unknown };
      if (typeof obj.comparison === "object") {
        const summary = typeof obj.summary === "string" ? obj.summary : undefined;
        const winner = typeof obj.winner === "string" ? obj.winner : undefined;
        return { comparison: obj.comparison, summary, winner };
      }
    } else {
      // 可能是直接的 ProductComparison（旧版兼容），直接构造 StructuredResult
      // 这里需要判断对象值是否都是 Record<string, string>，但为了简单，直接返回
      return { comparison: parsed as Record<string, Record<string, string>> };
    }
  }

  // 如果上面的都无法处理，降级为 raw
  return { raw: text };
}
// ========= 修改结束 =========

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(authHeader);
    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }
    const userId = user.id;

    const body = await req.json();
    const query = body.query;

    if (!query) {
      return NextResponse.json({ success: false, error: "Missing query" }, { status: 400 });
    }

    if (query.length > 200) {
      return NextResponse.json(
        { success: false, error: "Query too long. Please keep it under 200 characters." },
        { status: 400 }
      );
    }

    console.log("👉 calling AI...");
    const completion = await ai.chat.completions.create({
      model: "deepseek-v4-flash",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            'You are a product comparison AI. Return a valid JSON object with a "products" array, a "summary" string, and a "winner" string (optional). Each item in the products array must have "type", "name", "price", and "features" array of strings. No other text.',
        },
        { role: "user", content: `Compare: ${query}` },
      ],
    });

    if (!completion.choices || completion.choices.length === 0) {
      return NextResponse.json({ success: false, error: "No valid choices from AI" }, { status: 500 });
    }

    const raw = completion.choices[0]?.message?.content || "";
    if (typeof raw === "string" && raw.startsWith("<!doctype")) {
      throw new Error("AI returned HTML. Check baseURL or API key.");
    }

    const result = parseAndConvert(raw);

    // 存入数据库（result 已经是结构化格式）
    await supabaseAdmin.from("comparisons").insert([
      {
        user_id: userId,
        items: query,
        criteria: "AI",
        result: result as unknown as Record<string, unknown>,
      },
    ]);

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}