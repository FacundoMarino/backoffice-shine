"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export function UsersTabs({ active }: { active: "trabajadores" | "clientes" }) {
  return (
    <div className="inline-flex rounded-xl bg-background p-1">
      <Link
        href="/usuarios?tab=trabajadores"
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-semibold",
          active === "trabajadores"
            ? "bg-primary-soft text-primary"
            : "text-muted-foreground",
        )}
      >
        Trabajadores
      </Link>
      <Link
        href="/usuarios?tab=clientes"
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-semibold",
          active === "clientes"
            ? "bg-primary-soft text-primary"
            : "text-muted-foreground",
        )}
      >
        Clientes
      </Link>
    </div>
  );
}
