"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { deletePlan, savePlan } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";

type Plan = {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  description: string | null;
  isActive: boolean;
};

export function PlansManager({ initial }: { initial: Plan[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: "",
    durationMonths: 1,
    price: 0,
    description: "",
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openNew() {
    setEditing(null);
    setForm({
      name: "",
      durationMonths: 1,
      price: 0,
      description: "",
      isActive: true,
    });
    setOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);
    setForm({
      name: plan.name,
      durationMonths: plan.durationMonths,
      price: plan.price,
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
        durationMonths: Number(form.durationMonths),
        price: Number(form.price),
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
            <div className="text-2xl font-extrabold text-primary">
              ${Number(plan.price).toFixed(2)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                / {plan.durationMonths} mes{plan.durationMonths > 1 ? "es" : ""}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {plan.description || "Sin descripción"}
            </p>
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
          <div className="w-full max-w-md rounded-[18px] bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">
              {editing ? "Editar plan" : "Nuevo plan"}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nombre"
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
              />
              <input
                type="number"
                min={1}
                value={form.durationMonths}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    durationMonths: Number(e.target.value),
                  }))
                }
                placeholder="Duración (meses)"
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
                placeholder="Precio"
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
              />
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Descripción"
                rows={3}
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
              />
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
