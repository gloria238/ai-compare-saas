// middleware.ts（修复 TypeScript 错误版本）
import { NextRequest, NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export function middleware(req: NextRequest) {
  // 只对 /api/compare 和 /api/limit 进行速率限制
  if (
    req.nextUrl.pathname.startsWith("/api/compare") ||
    req.nextUrl.pathname.startsWith("/api/limit")
  ) {
    // 从 x-forwarded-for 头获取客户端真实 IP（兼容本地和 Vercel 环境）
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 分钟窗口
    const maxRequests = 15; // 每分钟最多请求数

    const key = `rate_${ip}`;
    const current = rateLimitMap.get(key);

    if (!current || now - current.timestamp > windowMs) {
      rateLimitMap.set(key, { count: 1, timestamp: now });
      return NextResponse.next();
    }

    current.count++;
    if (current.count > maxRequests) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};