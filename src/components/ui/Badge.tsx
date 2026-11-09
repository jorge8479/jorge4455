"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "accent" | "success" | "warning" | "danger" | "purple";
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
}

export default function Badge({ children, variant = "default", size = "sm", pulse, className }: BadgeProps) {
  const variants = {
    default: "bg-dark-700 text-dark-300",
    primary: "bg-primary-500/20 text-primary-400 border border-primary-500/30",
    accent: "bg-accent-500/20 text-accent-400 border border-accent-500/30",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        pulse && "animate-pulse",
        className
      )}
    >
      {children}
    </span>
  );
}
