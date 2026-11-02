"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  ListChecks,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/verificacion", label: "Verificación de perfiles", icon: ShieldCheck },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/servicios", label: "Servicios", icon: ListChecks },
  { href: "/ubicaciones", label: "Ubicaciones", icon: MapPin },
  { href: "/planes", label: "Planes de suscripción", icon: CreditCard },
  { href: "/suscripciones", label: "Suscripciones pagas", icon: ReceiptText },
  { href: "/resenas", label: "Reseñas", icon: Star },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-7 border-r border-(--sidebar-border) bg-sidebar px-4 py-6">
      <div className="flex items-center gap-1.5 px-2">
        <span className="text-[17px] font-extrabold tracking-tight text-foreground">
          CLEAN
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
          <circle cx="9" cy="12" r="7.5" fill="#8FB6CF" opacity="0.85" />
          <circle cx="15" cy="12" r="7.5" fill="#5FA0BE" opacity="0.85" />
        </svg>
        <span className="text-[17px] font-extrabold tracking-tight text-foreground">
          NNECT
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-[#374151] hover:bg-background",
              )}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[14px] bg-background px-3 py-3.5">
        <div className="text-[11px] font-medium text-muted-foreground">
          CleanConnect
        </div>
        <div className="mt-0.5 text-[11px] text-[#9AA4B2]">
          Limpieza confiable, verificada.
        </div>
      </div>
    </aside>
  );
}
