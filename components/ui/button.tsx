"use client";

import { cn } from "@/lib/utils";

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const variants = {
    primary: "bg-primary text-white hover:bg-[#7aa7c2]",
    secondary:
      "bg-white text-primary border border-primary hover:bg-primary-soft/40",
    danger: "bg-destructive text-white hover:bg-[#e63c3c]",
    ghost: "bg-transparent text-primary hover:bg-primary-soft/50",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
