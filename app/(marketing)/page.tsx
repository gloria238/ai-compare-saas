"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Zap,
  Table2,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50/30 text-slate-800">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Compare
          </span>
          <button
            onClick={() => router.push("/login")}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-all hover:shadow-lg"
          >
            Start comparing →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight lg:text-6xl">
            Stop wasting time comparing products manually
          </h1>
          <p className="text-xl text-slate-600 max-w-lg">
            Get an instant AI comparison — and know{" "}
            <span className="font-semibold text-indigo-600">
              exactly what to choose
            </span>{" "}
            in seconds.
          </p>

          {/* 伪输入框 + CTA */}
          <div className="bg-white shadow-xl rounded-2xl p-2 flex items-center gap-2 border border-slate-200/80 max-w-md">
            <input
              type="text"
              readOnly
              value='Try: "MacBook Air vs Dell XPS 13"'
              className="flex-1 px-4 py-3 text-slate-500 outline-none text-sm bg-transparent cursor-text"
            />
            <button
              onClick={() => router.push("/login")}
              className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all hover:shadow-lg flex items-center gap-2"
            >
              Start comparing <ArrowRight size={16} />
            </button>
          </div>

          <p className="text-sm text-slate-500">Free today · 5 comparisons included</p>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-white"
                />
              ))}
            </div>
            <span>Over 500 comparisons generated</span>
            <span className="flex items-center gap-1">
              <Star size={14} className="text-amber-500" /> 4.9/5
            </span>
          </div>
        </div>

        {/* DEMO CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 animate-fade-in-up [animation-delay:200ms]">
          <div className="text-sm text-slate-500 mb-4">
            📱 iPhone 15 vs Samsung S24
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-100 mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-medium">Feature</th>
                  <th className="text-left p-3 font-medium">iPhone 15</th>
                  <th className="text-left p-3 font-medium">Samsung S24</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 text-slate-600">Price</td>
                  <td className="p-3 font-medium">$999</td>
                  <td className="p-3 font-medium">$859</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-600">Battery</td>
                  <td className="p-3 font-medium">20h</td>
                  <td className="p-3 font-medium">24h</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-600">Refresh Rate</td>
                  <td className="p-3 font-medium">60Hz</td>
                  <td className="p-3 font-medium">120Hz</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl text-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-indigo-600" />
              <span className="font-bold text-indigo-900">
                🏆 Winner: Samsung S24
              </span>
            </div>
            <p className="font-medium text-slate-700 mb-2">Why it wins</p>
            <ul className="space-y-1 text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" /> 20% longer battery life
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" /> 2x smoother display (120Hz vs 60Hz)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" /> Better price-to-performance ratio
              </li>
            </ul>
            <p className="mt-3 font-semibold text-indigo-800">
              → Best choice for most users
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Based on performance, battery and value
            </p>
          </div>
        </div>
      </section>

      {/* 信任锚点 */}
      <div className="max-w-4xl mx-auto px-6 pb-10 flex items-center justify-center gap-3 text-slate-500 text-sm">
        <Users size={18} />
        <span>Used by freelancers, founders and product teams</span>
      </div>

      {/* 痛点区 */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Still doing this?</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: XCircle, text: "Reading 10+ reviews" },
            { icon: XCircle, text: "Comparing specs manually" },
            { icon: XCircle, text: "Unsure which one is actually better" },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-slate-200"
            >
              <Icon size={24} className="text-red-400" />
              <span className="text-slate-700 font-medium">{text}</span>
            </div>
          ))}
        </div>
        <p className="text-center mt-6 text-indigo-600 font-semibold">
          → Let AI decide for you in seconds
        </p>
      </section>

      {/* 使用场景 */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Perfect for</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            "Choosing between phones or laptops",
            "Comparing SaaS tools",
            "Quick decision making before buying",
          ].map((text) => (
            <div
              key={text}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <p className="text-slate-700 font-medium">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold text-center mb-16">
          More than a comparison table
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "⚡ Get answers in 10 seconds",
              desc: "No more research. Just type and get structured results instantly.",
            },
            {
              icon: Star,
              title: "🧠 AI picks the best option",
              desc: "We don’t just compare — we tell you what to choose and why.",
            },
            {
              icon: Table2,
              title: "📊 Clear, structured comparisons",
              desc: "No clutter. Just the data that matters.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Icon className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-3xl font-bold mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-4xl font-extrabold mb-4">$0</p>
            <ul className="text-slate-600 space-y-3 mb-8">
              <li>5 comparisons per day</li>
              <li>AI‑powered results</li>
              <li>History access</li>
            </ul>
            <button
              onClick={() => router.push("/login")}
              className="w-full border border-slate-300 rounded-full py-3 font-medium hover:bg-slate-50 transition"
            >
              Start comparing →
            </button>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl scale-105 relative">
            <div className="absolute -top-3 right-8 bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-4xl font-extrabold mb-1">
              $9.9<span className="text-lg font-normal">/mo</span>
            </p>
            <p className="text-sm text-indigo-200 mb-6">Only $0.33/day</p>
            <ul className="space-y-3 mb-8 text-indigo-100">
              <li>✔ Unlimited comparisons</li>
              <li>✔ Faster AI responses</li>
              <li>✔ Smart recommendations (winner + reasoning)</li>
              <li>✔ Priority processing</li>
            </ul>
            <p className="text-xs text-indigo-200 mb-4">
              Most users upgrade after their first 5 comparisons
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-white text-indigo-700 rounded-full py-3 font-semibold hover:bg-indigo-50 transition"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-slate-100/50 py-16 px-8 text-center">
        <h2 className="text-2xl font-semibold mb-8">Loved by decision makers</h2>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border">
            <p className="text-slate-700 italic">
              “Saved me hours of research when buying my laptop.”
            </p>
            <p className="text-sm text-slate-500 mt-2">
              — Dan W., Freelance Developer
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <p className="text-slate-700 italic">
              “The AI recommendation is surprisingly accurate.”
            </p>
            <p className="text-sm text-slate-500 mt-2">
              — Sarah L., Product Manager
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Start your first comparison →</h2>
        <p className="text-slate-600 mb-2">Takes less than 10 seconds</p>
        <p className="text-sm text-slate-500 mb-8">No credit card · 5 free comparisons</p>
        <button
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-white font-semibold shadow-lg hover:bg-indigo-700 transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          Start comparing <ArrowRight size={18} />
        </button>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} AI Compare. All rights reserved.
      </footer>
    </div>
  );
}