"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { checkLimit } from "@/lib/check-limit";
import Result from "@/components/compare/Result";
import LoadingSkeleton from "@/components/compare/LoadingSkeleton";
import type { AIResponse } from "@/types/ai";
import type { User } from "@supabase/supabase-js";
import { Crown, LogOut } from "lucide-react";

interface HistoryItem {
  id: string;
  items: string;
  created_at: string;
  result: Record<string, unknown> | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabase();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // 初始化用户、Pro状态、历史记录
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!currentUser) {
        router.push("/login");
        setLoadingUser(false);
        return;
      }

      setUser(currentUser);
      // 先重置 Pro 状态，防止残留
      setIsPro(false);

      const [profileRes, historyRes] = await Promise.all([
        supabase.from("users").select("is_pro").eq("id", currentUser.id).single(),
        supabase
          .from("comparisons")
          .select("id, items, result, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (cancelled) return;

      if (profileRes.error) {
        console.error("查询 users 表出错：", profileRes.error);
        setIsPro(false);
      } else {
        setIsPro(profileRes.data?.is_pro ?? false);
      }

      if (!historyRes.error && historyRes.data) {
        setHistory(historyRes.data as HistoryItem[]);
      }

      setLoadingUser(false);
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 关键：监听支付成功回调参数，主动刷新 Pro 状态
  useEffect(() => {
    const isProSuccess = searchParams.get("pro") === "success";
    if (isProSuccess && user) {
      const refreshPro = async () => {
        const { data: profile } = await supabase
          .from("users")
          .select("is_pro")
          .eq("id", user.id)
          .single();
        if (profile) setIsPro(profile.is_pro ?? false);
        // 清除 URL 参数，避免重复触发
        router.replace("/dashboard");
      };
      refreshPro();
    }
  }, [searchParams, user, supabase, router]);

  // 登录状态监听
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // 手动刷新历史记录
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data: historyData } = await supabase
      .from("comparisons")
      .select("id, items, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (historyData) setHistory(historyData as HistoryItem[]);
    setLoadingHistory(false);
  }, [user, supabase]);

  // 执行对比
  const handleCompare = useCallback(async () => {
    if (!query || !user) return;

    if (!isPro) {
      const allowed = await checkLimit(user.id);
      if (!allowed) {
        setError("Daily limit reached (5/day). Upgrade to Pro for unlimited comparisons.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, userId: user.id }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data as AIResponse);
        fetchHistory();
      } else {
        setError(json.error ?? "Comparison failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [query, user, isPro, fetchHistory]);

  // 升级 Pro
  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setError("Upgrade failed, please try again.");
    }
  };

  // 提取 winner
  function getWinner(result: HistoryItem["result"]): string | null {
    if (!result || typeof result !== "object" || Array.isArray(result)) return null;
    const obj = result as Record<string, unknown>;
    if (typeof obj.winner === "string") return obj.winner;
    return null;
  }

  // 提取 summary
  function getSummary(result: HistoryItem["result"]): string | null {
    if (!result || typeof result !== "object" || Array.isArray(result)) return null;
    const obj = result as Record<string, unknown>;
    if (typeof obj.summary === "string") return obj.summary;
    return null;
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition"
          >
            AI Compare
          </Link>
          <div className="flex items-center gap-4">
            {!isPro && (
              <button
                onClick={handleUpgrade}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-sm font-medium text-slate-900 hover:shadow-md transition"
              >
                <Crown size={14} /> Pro
              </button>
            )}
            <span className="text-sm text-slate-600 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="p-2 rounded-full hover:bg-slate-100 transition"
            >
              <LogOut size={18} className="text-slate-500" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in-up">
        <h2 className="text-4xl font-bold mb-8 text-center">
          Compare anything instantly
        </h2>

        {/* 输入区 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-xl border border-slate-200/60 mb-8">
          <div className="flex items-center gap-2 bg-white rounded-xl p-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCompare()}
              placeholder="e.g. iPhone 15 vs Samsung S24"
              className="flex-1 px-5 py-3 outline-none text-lg"
              autoFocus
            />
            <button
              onClick={handleCompare}
              disabled={loading || !query}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all hover:shadow-lg"
            >
              {loading ? "Comparing..." : "Compare"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}
        {!loading && data && <Result data={data} />}

        {/* 历史记录 */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-6">Recent comparisons</h3>
          {loadingHistory ? (
            <p className="text-slate-500">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-slate-500 italic">
              Your comparisons will appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => {
                const winner = getWinner(item.result);
                const summary = getSummary(item.result);
                return (
                  <div
                    key={item.id}
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-slate-200/60 hover:shadow-md transition"
                  >
                    <div className="flex flex-col gap-2">
                      <h4 className="font-semibold text-slate-800 text-lg">
                        {item.items}
                      </h4>
                      {winner && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                          🏆 {winner}
                        </div>
                      )}
                      {summary && (
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {summary}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(item.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}