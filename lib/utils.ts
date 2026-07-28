import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function verificationLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "En revisión";
    case "VERIFIED":
      return "Aprobado";
    case "REJECTED":
      return "Rechazado";
    default:
      return status;
  }
}

export function accountStatusLabel(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Activo";
    case "SUSPENDED":
      return "Suspendido";
    case "BANNED":
      return "Baneado";
    default:
      return status;
  }
}

export function subscriptionLabel(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Activa";
    case "PAUSED":
      return "Suspendido";
    case "NONE":
      return "Vencida";
    default:
      return status;
  }
}
