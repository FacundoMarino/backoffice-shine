"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { syncIdentityVerification } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function SyncIdentityButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSync() {
    setError(null);
    startTransition(async () => {
      const res = await syncIdentityVerification(id);
      if (res.error) {
        setError(res.error.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button variant="secondary" onClick={onSync} disabled={pending}>
        {pending ? "Actualizando…" : "Actualizar desde Namirial"}
      </Button>
    </div>
  );
}
