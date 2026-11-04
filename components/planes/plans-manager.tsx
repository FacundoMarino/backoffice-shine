"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { deletePlan, savePlan } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";

type PlanAudience = "CLIENT" | "WORKER";

type Plan = {
  id: string;
  name: string;
  audience: PlanAudience;
  durationMonths: number;
  price: number;
  currency: string;
  contactQuota: number | null;
  annualDiscountPercent: number | null;
  isFeatured: boolean;
  trialDays: number;
  description: string | null;
  isActive: boolean;
  stripeProductId: string | null;
  stripePriceId: string | null;
};

const emptyForm = {
  name: "",
  audience: "CLIENT" as PlanAudience,
  durationMonths: 1,
  price: 0,
  contactQuota: "" as string | number,
  unlimitedQuota: false,
  annualDiscountPercent: "" as string | number,
  isFeatured: false,
  trialDays: 0,
  description: "",
  isActive: true,
};

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function PlansManager({ initial }: { initial: Plan[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setForm({
      name: plan.name,
      audience: plan.audience ?? "WORKER",
      durationMonths: plan.durationMonths,
      price: plan.price,
      contactQuota: plan.contactQuota ?? "",
      unlimitedQuota: plan.contactQuota == null,
      annualDiscountPercent: plan.annualDiscountPercent ?? "",
      isFeatured: plan.isFeatured ?? false,
      trialDays: plan.trialDays ?? 0,
      description: plan.description ?? "",
      isActive: plan.isActive,
    });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    startTransition(async () => {
      const res = await savePlan({
        id: editing?.id,
        name: form.name.trim(),
        audience: form.audience,
        durationMonths: Number(form.durationMonths),
        price: Number(form.price),
        contactQuota: form.unlimitedQuota
          ? null
          : form.contactQuota === ""
            ? null
            : Number(form.contactQuota),
        annualDiscountPercent:
          form.annualDiscountPercent === ""
            ? null
            : Number(form.annualDiscountPercent),
        isFeatured: form.isFeatured,
        trialDays: Number(form.trialDays),
        description: form.description || undefined,
        isActive: form.isActive,
      });
      if (res.error) setError(res.error.message);
      else {
        setOpen(false);
        setError(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={openNew}>Nuevo plan</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {initial.map((plan) => (
          <Card key={plan.id} className="flex flex-col gap-3 p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="text-lg font-bold">{plan.name}</div>
              <StatusChip
                label={plan.isActive ? "Activo" : "Inactivo"}
                tone={plan.isActive ? "success" : "neutral"}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusChip
                label={plan.audience === "CLIENT" ? "Cliente" : "Limpieza"}
                tone="info"
              />
              {plan.isFeatured ? (
                <StatusChip label="Destacado" tone="warning" />
              ) : null}
              <StatusChip
                label={
                  plan.contactQuota == null
                    ? "Ilimitado"
                    : `${plan.contactQuota} contactos`
                }
                tone="neutral"
              />
            </div>
            <div className="text-2xl font-extrabold text-primary">
              €{Number(plan.price).toFixed(2)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                / {plan.durationMonths} mes{plan.durationMonths > 1 ? "es" : ""}
              </span>
            </div>
            {plan.annualDiscountPercent != null ? (
              <p className="text-xs text-muted-foreground">
                Descuento anual: {plan.annualDiscountPercent}%
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {plan.description || "Sin descripción"}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                Stripe product:{" "}
                <span className="font-mono">
                  {plan.stripeProductId ?? "—"}
                </span>
              </div>
              <div>
                Stripe price:{" "}
                <span className="font-mono">
                  {plan.stripePriceId ?? (Number(plan.price) <= 0 ? "gratis" : "pendiente")}
                </span>
              </div>
            </div>
            <div className="mt-auto flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => openEdit(plan)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-background"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deletePlan(plan.id);
                    router.refresh();
                  })
                }
                className="rounded-xl p-2 text-muted-foreground hover:bg-background hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.45)] p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">
              {editing ? "Editar plan" : "Nuevo plan"}
            </h3>
            <div className="flex flex-col gap-3">
              <Field label="Nombre">
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ej. Plan Estándar"
                  className={inputClass}
                />
              </Field>
              <Field label="Audiencia">
                <select
                  value={form.audience}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      audience: e.target.value as PlanAudience,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="CLIENT">Cliente / Familia</option>
                  <option value="WORKER">Personal de limpieza</option>
                </select>
              </Field>
              <Field label="Duración">
                <select
                  value={form.durationMonths}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      durationMonths: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                >
                  <option value={1}>Mensual (1 mes)</option>
                  <option value={6}>Semestral (6 meses)</option>
                  <option value={12}>Anual (12 meses)</option>
                </select>
              </Field>
              <Field label="Precio (€)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.unlimitedQuota}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      unlimitedQuota: e.target.checked,
                    }))
                  }
                />
                Contactos ilimitados
              </label>
              {!form.unlimitedQuota ? (
                <Field label="Contactos por periodo">
                  <input
                    type="number"
                    min={0}
                    value={form.contactQuota}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contactQuota: e.target.value,
                      }))
                    }
                    placeholder="Ej. 5"
                    className={inputClass}
                  />
                </Field>
              ) : null}
              <Field label="Descuento anual % (opcional)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.annualDiscountPercent}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      annualDiscountPercent: e.target.value,
                    }))
                  }
                  placeholder="Ej. 10"
                  className={inputClass}
                />
              </Field>
              <Field label="Días de trial">
                <input
                  type="number"
                  min={0}
                  value={form.trialDays}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      trialDays: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                  }
                />
                Destacado en listados (Pro limpieza)
              </label>
              <Field label="Descripción">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Texto opcional del plan"
                  rows={3}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                Activo
              </label>
            </div>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={save} disabled={pending} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
