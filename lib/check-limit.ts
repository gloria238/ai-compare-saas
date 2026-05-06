// lib/check-limit.ts（安全强化版）
export async function checkLimit(userId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch("/api/limit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 服务端会从 token 中提取真正的 userId
      },
      // 不再需要 body 传 userId
    });
    const data = await res.json();
    return data.allowed ?? false;
  } catch {
    return false; // 网络异常等默认拒绝
  }
}