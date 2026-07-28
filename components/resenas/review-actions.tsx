"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteReview, hideReview } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function ReviewActions({ id, hidden }: { id: string; hidden: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"hide" | "delete" | null>(null);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    if (!reason.trim()) {
      setError("Seleccioná un motivo");
      return;
    }
    startTransition(async () => {
      const res =
        mode === "delete"
          ? await deleteReview(id, reason, comment || undefined)
          : await hideReview(id, reason, comment || undefined);
      if (res.error) setError(res.error.message);
      else {
        setMode(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {!hidden ? (
          <button
            type="button"
            onClick={() => setMode("hide")}
            className="text-xs font-bold text-muted-foreground hover:underline"
          >
            Ocultar
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMode("delete")}
          className="text-xs font-bold text-destructive hover:underline"
        >
          Eliminar
        </button>
      </div>

      {mode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.45)] p-4">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">
              {mode === "delete" ? "Eliminar reseña" : "Ocultar reseña"}
            </h3>
            <label className="mb-3 flex flex-col gap-1.5 text-sm font-medium">
              Motivo
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2.5"
              >
                <option value="">Seleccionar…</option>
                <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
                <option value="Spam">Spam</option>
                <option value="Información falsa">Información falsa</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
            <label className="mb-4 flex flex-col gap-1.5 text-sm font-medium">
              Comentario
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setMode(null)} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant={mode === "delete" ? "danger" : "primary"}
                onClick={confirm}
                disabled={pending}
                className="flex-1"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
