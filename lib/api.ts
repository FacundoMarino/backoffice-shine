import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "./env";

export type ApiSuccess<T> = { data: T; error: null };
export type ApiFailure = {
  data: null;
  error: { message: string; status: number };
};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

function normalizeApiMessage(body: unknown): string {
  if (body !== null && typeof body === "object" && "message" in body) {
    const raw = (body as { message: unknown }).message;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) {
      return raw.filter((s): s is string => typeof s === "string").join(", ");
    }
  }
  return "Ocurrió un error inesperado";
}

function isInvalidOrExpiredTokenMessage(message: string): boolean {
  return message.toLowerCase().includes("invalid or expired token");
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { authToken?: string | null },
): Promise<ApiResult<T>> {
  const { authToken, ...init } = options ?? {};
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const body: unknown = await res.json().catch(() => ({}));
      const message = normalizeApiMessage(body);
      if (res.status === 401 && isInvalidOrExpiredTokenMessage(message)) {
        const cookieStore = await cookies();
        cookieStore.delete(env.SESSION_COOKIE_NAME);
        redirect("/login");
      }
      return { data: null, error: { message, status: res.status } };
    }

    if (res.status === 204) {
      return { data: null as T, error: null };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: { message: "Error de red", status: 0 },
    };
  }
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(env.SESSION_COOKIE_NAME)?.value ?? null;
}
