"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { banUser, unbanUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function BanButton({
  userId,
  nombre,
  banned,
}: {
  userId: string;
  nombre: string;
  banned: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    if (banned) {
      startTransition(async () => {
        const res = await unbanUser(userId);
        if (res.error) setError(res.error.message);
        else {
          setOpen(false);
          router.refresh();
        }
      });
      return;
    }
    if (!reason.trim()) {
      setError("Seleccioná un motivo");
      return;
    }
    startTransition(async () => {
      const res = await banUser(userId, reason, comment || undefined);
      if (res.error) setError(res.error.message);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-destructive hover:underline"
      >
        {banned ? "Desbanear" : "Banear"}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.45)] p-4">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6">
            <h3 className="mb-2 text-lg font-bold">
              {banned ? "Desbanear usuario" : "Banear usuario"}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">{nombre}</p>
            {!banned ? (
              <>
                <label className="mb-3 flex flex-col gap-1.5 text-sm font-medium">
                  Motivo
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="rounded-xl border border-input bg-background px-3 py-2.5"
                  >
                    <option value="">Seleccionar…</option>
                    <option value="Conducta inapropiada">Conducta inapropiada</option>
                    <option value="Fraude">Fraude</option>
                    <option value="Spam">Spam</option>
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
              </>
            ) : null}
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                variant={banned ? "primary" : "danger"}
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
