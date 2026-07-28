import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { apiFetch } from "./api";
import { env } from "./env";

export type AdminSession = {
  user: {
    id: string;
    email: string;
    role: string;
    accountStatus: string;
    name: string;
    initials: string;
  };
  accessToken: string;
};

type MeResponse = {
  user: { id: string; email?: string };
  account: {
    id: string;
    email: string;
    role: string;
    accountStatus: string;
  } | null;
};

async function readSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const result = await apiFetch<MeResponse>("/auth/me", { authToken: token });
  if (result.error || !result.data.account) return null;

  const { account, user } = result.data;
  if (account.role !== "ADMIN" || account.accountStatus !== "ACTIVE") {
    return null;
  }

  const email = account.email || user.email || "";
  const name = email.split("@")[0] || "Admin";
  const initials = name.slice(0, 2).toUpperCase();

  return {
    accessToken: token,
    user: {
      id: account.id,
      email,
      role: account.role,
      accountStatus: account.accountStatus,
      name,
      initials,
    },
  };
}

export const getSession = cache(readSession);
