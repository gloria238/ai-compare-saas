import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm ${hover ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300" : ""} ${className}`}
    >
      {children}
    </div>
  );
}