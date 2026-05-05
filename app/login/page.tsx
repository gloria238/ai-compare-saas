"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = getSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 监听登录状态，成功后跳转到应用主页 /dashboard
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/dashboard");  // 改为 /dashboard
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleEmailLogin = async (type: "signin" | "signup") => {
    setLoading(true);
    setErrorMsg(null);

    const { error } =
      type === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else if (type === "signup") {
      setErrorMsg(null);
      alert("Check your email to confirm signup!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/60 p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-slate-600 mt-2">Sign in to continue comparing</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            onKeyDown={(e) => e.key === "Enter" && handleEmailLogin("signin")}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            onKeyDown={(e) => e.key === "Enter" && handleEmailLogin("signin")}
          />
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleEmailLogin("signin")}
            disabled={loading || !email || !password}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all hover:shadow-lg"
          >
            {loading ? "Please wait..." : "Sign In"}
          </button>
          <button
            onClick={() => handleEmailLogin("signup")}
            disabled={loading || !email || !password}
            className="w-full bg-slate-100 text-slate-800 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}