"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { approveVerification, rejectVerification } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function VerificationActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onApprove() {
    startTransition(async () => {
      const res = await approveVerification(id);
      if (res.error) {
        setError(res.error.message);
        return;
      }
      router.push("/verificacion");
      router.refresh();
    });
  }

  function onReject() {
    if (!reason.trim()) {
      setError("Seleccioná un motivo");
      return;
    }
    startTransition(async () => {
      const res = await rejectVerification(id, reason, comment || undefined);
      if (res.error) {
        setError(res.error.message);
        return;
      }
      router.push("/verificacion");
      router.refresh();
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-3 border-t border-background pt-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-3">
        <Button onClick={onApprove} disabled={pending} className="flex-1">
          Aprobar
        </Button>
        <Button
          variant="danger"
          onClick={() => setRejectOpen(true)}
          disabled={pending}
          className="flex-1"
        >
          Rechazar
        </Button>
      </div>

      {rejectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.45)] p-4">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Rechazar perfil</h3>
            <label className="mb-3 flex flex-col gap-1.5 text-sm font-medium">
              Motivo
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2.5"
              >
                <option value="">Seleccionar…</option>
                <option value="Documento ilegible">Documento ilegible</option>
                <option value="Datos inconsistentes">Datos inconsistentes</option>
                <option value="Documento vencido">Documento vencido</option>
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
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setRejectOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={onReject} disabled={pending} className="flex-1">
                Confirmar rechazo
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
