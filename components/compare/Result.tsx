"use client";

import { Crown } from "lucide-react";
import type { AIResponse } from "@/types/ai";

type Props = { data: AIResponse | null };

// 类型守卫
function hasComparison(data: AIResponse): data is { comparison: Record<string, Record<string, string>>; summary?: string; winner?: string } {
  return typeof data === "object" && data !== null && "comparison" in data;
}

export default function Result({ data }: Props) {
  if (!data) return null;

  // 降级处理：raw 文本
  if ("raw" in data) {
    return (
      <div className="mt-6 p-6 border border-red-200 rounded-2xl bg-red-50 text-red-700">
        {data.raw}
      </div>
    );
  }

  // 正常结构化数据
  if (!hasComparison(data)) return null;

  const { comparison, summary, winner } = data;
  const products = Object.keys(comparison);
  if (products.length < 2) return null;

  return (
    <div className="mt-8 space-y-8">
      {/* 推荐结论区块 */}
      {summary && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-sm animate-fade-in-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-xl font-bold text-indigo-900 mb-1">
                AI Recommendation
              </h3>
              <p className="text-slate-700 leading-relaxed">{summary}</p>
              {winner && (
                <div className="mt-3 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-semibold">
                  <Crown size={16} />
                  Best choice: {winner}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 产品对比卡片网格 */}
      <div className="grid md:grid-cols-2 gap-6">
        {products.map((product) => {
          const isWinner = winner === product;
          return (
            <div
              key={product}
              className={`relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                isWinner
                  ? "border-amber-400 shadow-lg ring-1 ring-amber-300"
                  : "border-slate-200/60 shadow-sm hover:border-indigo-300"
              }`}
            >
              {/* 胜出标记 */}
              {isWinner && (
                <div className="absolute -top-3 -right-3 bg-amber-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Crown size={12} /> BEST
                </div>
              )}

              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {product}
              </h2>
              <div className="space-y-4">
                {Object.entries(comparison[product]).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-baseline border-b border-slate-100 pb-2"
                  >
                    <span className="text-slate-500 capitalize text-sm">
                      {key}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}