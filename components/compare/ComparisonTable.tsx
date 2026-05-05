"use client";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

type Props = { data: Json | null };

export default function ComparisonTable({ data }: Props) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return (
      <div className="text-slate-400 text-sm p-4 bg-slate-50 rounded-xl">
        No valid comparison data
      </div>
    );
  }

  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const features = new Set<string>();
  entries.forEach(([_, value]) => {
    if (typeof value === "object" && value !== null) {
      Object.keys(value).forEach((k) => features.add(k));
    }
  });

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-4 font-medium text-slate-600">
              Feature
            </th>
            {entries.map(([name]) => (
              <th key={name} className="text-left p-4 font-medium text-slate-800">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[...features].map((feature) => (
            <tr key={feature}>
              <td className="p-4 text-slate-500 capitalize">{feature}</td>
              {entries.map(([_, value], i) => {
                const v =
                  typeof value === "object" && value !== null
                    ? (value as Record<string, Json>)[feature]
                    : null;
                return (
                  <td key={i} className="p-4 font-medium">
                    {v !== null && v !== undefined ? String(v) : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}