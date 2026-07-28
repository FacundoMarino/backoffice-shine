"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { createService, deleteService, toggleService } from "@/actions/admin";
import { Button } from "@/components/ui/button";

type Service = { id: string; name: string; isActive: boolean };

export function ServicesManager({ initial }: { initial: Service[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          startTransition(async () => {
            const res = await createService(name.trim());
            if (res.error) setError(res.error.message);
            else {
              setName("");
              setError(null);
              refresh();
            }
          });
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nuevo servicio…"
          className="min-w-[220px] flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none"
        />
        <Button type="submit" disabled={pending}>
          Agregar
        </Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="divide-y divide-background">
        {initial.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-4 py-3.5"
          >
            <div className="font-semibold">{s.name}</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await toggleService(s.id);
                    refresh();
                  })
                }
                className="relative h-6 w-10 rounded-full transition"
                style={{ background: s.isActive ? "#8FB6CF" : "#D8E3EB" }}
                aria-label="Toggle activo"
              >
                <span
                  className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow"
                  style={{ left: s.isActive ? 19 : 3 }}
                />
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteService(s.id);
                    refresh();
                  })
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
