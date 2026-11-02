"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  activateSubscription,
  pauseSubscription,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { formatDate, subscriptionLabel } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  currency: string;
  isActive: boolean;
  stripePriceId: string | null;
};

type Worker = {
  id: string;
  nombre: string;
  email: string;
  subscriptionStatus: string;
};

type Subscription = {
  id: string;
  stripeSubscriptionId: string | null;
  stripeStatus: string | null;
  worker: {
    id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
  };
  plan: { id: string; name: string; durationMonths: number } | null;
  price: number;
  currency: string;
  startsAt: string;
  renewsAt: string | null;
  isActive: boolean;
};

function stripeStatusLabel(status: string | null): string {
  if (!status) return "—";
  if (status === "approved_by_admin") return "Aprobada (admin)";
  if (status === "paused_by_admin") return "Suspendida (admin)";
  return status.replaceAll("_", " ");
}

function stripeStatusTone(status: string | null) {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "approved_by_admin"
  ) {
    return "success" as const;
  }
  if (
    status === "past_due" ||
    status === "unpaid" ||
    status === "paused" ||
    status === "paused_by_admin"
  ) {
    return "warning" as const;
  }
  if (status === "canceled" || status === "incomplete_expired") {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function SubscriptionsManager({
  subscriptions,
  workers,
  plans,
  filters,
}: {
  subscriptions: Subscription[];
  workers: Worker[];
  plans: Plan[];
  filters: { status?: string; planId?: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [workerProfileId, setWorkerProfileId] = useState("");
  const [planCatalogId, setPlanCatalogId] = useState("");

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );

  function activate() {
    if (!workerProfileId || !planCatalogId) {
      setError("Elegí trabajador y plan");
      return;
    }
    startTransition(async () => {
      const res = await activateSubscription({ workerProfileId, planCatalogId });
      if (res.error) {
        setError(res.error.message);
        return;
      }
      setError(null);
      setWorkerProfileId("");
      setPlanCatalogId("");
      router.refresh();
    });
  }

  function pause(id: string) {
    startTransition(async () => {
      const res = await pauseSubscription(id);
      if (res.error) {
        setError(res.error.message);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="mb-1 text-base font-bold">Activar suscripción</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Sin webhook: después del pago en Stripe, aprobá acá al trabajador con
          el plan correspondiente.
        </p>
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        <div className="grid gap-3 md:grid-cols-[1.4fr_1.2fr_auto]">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Trabajador
            <select
              value={workerProfileId}
              onChange={(e) => setWorkerProfileId(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2.5"
            >
              <option value="">Seleccionar…</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.nombre} · {worker.email} ({worker.subscriptionStatus})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Plan
            <select
              value={planCatalogId}
              onChange={(e) => setPlanCatalogId(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2.5"
            >
              <option value="">Seleccionar…</option>
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} · {plan.currency.toUpperCase()} {plan.price.toFixed(2)}
                  {!plan.stripePriceId ? " (sin Stripe price)" : ""}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button onClick={activate} disabled={pending} className="w-full md:w-auto">
              {pending ? "Guardando…" : "Activar"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <FilterLink href="/suscripciones" active={!filters.status && !filters.planId}>
            Todas
          </FilterLink>
          <FilterLink
            href="/suscripciones?status=ACTIVE"
            active={filters.status === "ACTIVE"}
          >
            Activas
          </FilterLink>
          <FilterLink
            href="/suscripciones?status=PAUSED"
            active={filters.status === "PAUSED"}
          >
            Suspendidas
          </FilterLink>
          <FilterLink
            href="/suscripciones?status=NONE"
            active={filters.status === "NONE"}
          >
            Inactivas
          </FilterLink>
          {plans.map((plan) => (
            <FilterLink
              key={plan.id}
              href={`/suscripciones?planId=${plan.id}`}
              active={filters.planId === plan.id}
            >
              {plan.name}
            </FilterLink>
          ))}
        </div>

        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.8fr_0.9fr] border-b border-(--sidebar-border) px-4 pb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <div>Trabajador</div>
          <div>Plan</div>
          <div>Estado</div>
          <div>Stripe</div>
          <div>Renueva</div>
          <div>Precio</div>
          <div>Acciones</div>
        </div>

        {subscriptions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay suscripciones para estos filtros.
          </p>
        ) : (
          subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.8fr_0.9fr] items-center border-b border-background px-4 py-4 text-[13.5px]"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">
                  {subscription.worker.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {subscription.worker.email}
                </div>
              </div>
              <div>
                {subscription.plan ? (
                  <>
                    <div className="font-medium">{subscription.plan.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {subscription.plan.durationMonths} mes
                      {subscription.plan.durationMonths > 1 ? "es" : ""}
                    </div>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div>
                <StatusChip
                  label={subscriptionLabel(subscription.worker.subscriptionStatus)}
                  tone={
                    subscription.worker.subscriptionStatus === "ACTIVE"
                      ? "success"
                      : subscription.worker.subscriptionStatus === "PAUSED"
                        ? "warning"
                        : "neutral"
                  }
                />
              </div>
              <div>
                <StatusChip
                  label={stripeStatusLabel(subscription.stripeStatus)}
                  tone={stripeStatusTone(subscription.stripeStatus)}
                />
              </div>
              <div>{formatDate(subscription.renewsAt ?? subscription.startsAt)}</div>
              <div>
                {subscription.currency} {subscription.price.toFixed(2)}
              </div>
              <div>
                {subscription.isActive ? (
                  <Button
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    disabled={pending}
                    onClick={() => pause(subscription.id)}
                  >
                    Suspender
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`rounded-xl border px-3 py-1.5 text-sm font-medium ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-input"
      }`}
    >
      {children}
    </a>
  );
}
