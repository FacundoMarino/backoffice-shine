"use server";

import { cookies } from "next/headers";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { loginSchema } from "@/types";

function callbackToRoute(url: string): Route {
  const u = url.trim();
  if (u.startsWith("/") && !u.includes("//") && !u.includes("..") && u.length <= 256) {
    return u as Route;
  }
  return "/dashboard";
}

function normalizeError(body: unknown, fallback = "Credenciales inválidas"): string {
  if (body === null || typeof body !== "object" || !("message" in body)) {
    return fallback;
  }
  const msg = (body as { message: unknown }).message;
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (Array.isArray(msg)) {
    const parts = msg.filter((m): m is string => typeof m === "string");
    if (parts.length > 0) return parts.join(", ");
  }
  return fallback;
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(env.SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function loginAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackRaw = formData.get("callbackUrl");
  const callbackUrl =
    typeof callbackRaw === "string" && callbackRaw.startsWith("/")
      ? callbackRaw
      : "/dashboard";
  const destination = callbackToRoute(callbackUrl);

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  let signInJson: unknown;
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });
    signInJson = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: normalizeError(signInJson) };
    }
  } catch {
    return { error: "Error de red" };
  }

  const token =
    signInJson !== null &&
    typeof signInJson === "object" &&
    "accessToken" in signInJson &&
    typeof (signInJson as { accessToken: unknown }).accessToken === "string"
      ? (signInJson as { accessToken: string }).accessToken
      : null;

  if (!token) {
    return { error: "Respuesta de autenticación inválida" };
  }

  const meRes = await fetch(`${env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const meJson = (await meRes.json().catch(() => null)) as {
    account?: { role?: string; accountStatus?: string };
  } | null;

  if (
    !meRes.ok ||
    meJson?.account?.role !== "ADMIN" ||
    meJson?.account?.accountStatus !== "ACTIVE"
  ) {
    return { error: "No tenés permisos de administrador" };
  }

  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(destination);
}
