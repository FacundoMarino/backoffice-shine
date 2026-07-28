"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-[18px] bg-white p-8 shadow-[0_1px_3px_rgba(17,24,39,0.06)]">
        <div className="mb-8 flex items-center justify-center gap-1.5">
          <span className="text-xl font-extrabold tracking-tight">CLEAN</span>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="9" cy="12" r="7.5" fill="#8FB6CF" opacity="0.85" />
            <circle cx="15" cy="12" r="7.5" fill="#5FA0BE" opacity="0.85" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight">NNECT</span>
        </div>
        <h1 className="mb-1 text-center text-xl font-bold">Backoffice</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Ingresá con tu cuenta de administrador
        </p>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Contraseña
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          {state.error ? (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
