"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ToastCardProps {
  message: string;
  variant?: "success" | "destructive" | "info";
  className?: string;
}

export function ToastCard({ message, variant = "success", className }: ToastCardProps) {
  if (!message) return null;

  const isDestructive = variant === "destructive";

  const cardBg = isDestructive
    ? "bg-[#D32F2F] text-white"
    : "bg-[#046A38] text-white";

  return (
    <div
      className={cn(
        "fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 transition-all duration-200 pointer-events-auto",
        className
      )}
    >
      <div
        className={cn(
          "px-7 py-3 rounded-full font-medium text-sm sm:text-base flex items-center justify-center min-w-[240px] max-w-md shadow-none select-none",
          cardBg
        )}
      >
        <span>{message}</span>
      </div>
    </div>
  );
}
