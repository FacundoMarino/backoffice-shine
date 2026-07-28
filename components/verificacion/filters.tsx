"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function VerificationFilters({
  initialQ,
  initialStatus,
  initialLocality,
  initialAccountType,
  ciudades,
}: {
  initialQ: string;
  initialStatus: string;
  initialLocality: string;
  initialAccountType: string;
  ciudades: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    const q = String(formData.get("q") ?? "").trim();
    const status = String(formData.get("status") ?? "");
    const locality = String(formData.get("locality") ?? "");
    const accountType = String(formData.get("accountType") ?? "");
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (locality) params.set("locality", locality);
    if (accountType) params.set("accountType", accountType);
    startTransition(() => {
      router.push(`/verificacion?${params.toString()}`);
    });
  }

  const selectClass =
    "rounded-full border border-input bg-background px-3.5 py-2.5 text-[13.5px] text-[#374151] outline-none";

  return (
    <form
      action={apply}
      className="flex flex-wrap items-center gap-3"
      data-pending={pending ? "1" : "0"}
    >
      <input
        name="q"
        defaultValue={initialQ}
        placeholder="Buscar por nombre..."
        className="min-w-[220px] flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-[13.5px] outline-none"
      />
      <select name="accountType" defaultValue={initialAccountType} className={selectClass}>
        <option value="">Todos</option>
        <option value="INDEPENDENT">Particular</option>
        <option value="COMPANY">Empresa</option>
      </select>
      <select name="locality" defaultValue={initialLocality} className={selectClass}>
        <option value="">Todas</option>
        {ciudades.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select name="status" defaultValue={initialStatus} className={selectClass}>
        <option value="">Todos</option>
        <option value="PENDING">En revisión</option>
        <option value="VERIFIED">Aprobado</option>
        <option value="REJECTED">Rechazado</option>
      </select>
      <button
        type="submit"
        className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white"
      >
        Filtrar
      </button>
    </form>
  );
}
