import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "cc_admin_session";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;

    const payloadPart = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const payloadJson = atob(payloadPart);
    const payload = JSON.parse(payloadJson) as { exp?: unknown };

    if (typeof payload.exp !== "number") return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const sessionToken = sessionCookie?.value;
  const hasValidSession = sessionToken ? !isTokenExpired(sessionToken) : false;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");

  if (!hasValidSession && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    const res = NextResponse.redirect(loginUrl);
    if (sessionToken) {
      res.cookies.delete(SESSION_COOKIE_NAME);
    }
    return res;
  }

  if (hasValidSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasValidSession && isAuthRoute && sessionToken) {
    const res = NextResponse.next();
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
