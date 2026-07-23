"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, variant = "default", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 sm:p-5 transition-all duration-300",
        {
          "bg-gradient-to-br from-[#1a1a20] to-[#141418] border border-white/[0.06] shadow-lg shadow-black/20": variant === "default",
          "bg-[#1a1a20]/80 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/30": variant === "glass",
          "bg-gradient-to-br from-[#1a1a20] via-[#16161a] to-[#121214] border border-white/[0.06] shadow-lg shadow-black/20": variant === "gradient",
          "hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 cursor-pointer": hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
