import Link from "next/link";

import { fetchVerifications } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { toneForVerification } from "@/lib/status-tones";
import { formatDate, verificationLabel } from "@/lib/utils";
import { VerificationFilters } from "@/components/verificacion/filters";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    locality?: string;
    accountType?: string;
  }>;
};

export default async function VerificacionPage({ searchParams }: Props) {
  const sp = await searchParams;
  const result = await fetchVerifications({
    q: sp.q,
    status: sp.status,
    locality: sp.locality,
    accountType: sp.accountType,
  });
  const rows = result.data ?? [];

  const ciudades = Array.from(
    new Set(rows.map((r) => r.ciudad).filter((c) => c && c !== "—")),
  ).sort();

  return (
    <>
      <PageTitle title="Verificación de perfiles" />
      <Card className="p-6">
        <VerificationFilters
          initialQ={sp.q ?? ""}
          initialStatus={sp.status ?? ""}
          initialLocality={sp.locality ?? ""}
          initialAccountType={sp.accountType ?? ""}
          ciudades={ciudades}
        />

        <div className="mt-5 grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr] border-b border-[var(--sidebar-border)] px-4 pb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <div>Nombre</div>
          <div>Tipo</div>
          <div>Ciudad</div>
          <div>Fecha de solicitud</div>
          <div>Estado</div>
        </div>

        {result.error ? (
          <p className="py-10 text-center text-sm text-destructive">
            {result.error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-[#9AA4B2]">
            No se encontraron perfiles con esos filtros.
          </p>
        ) : (
          rows.map((p) => (
            <Link
              key={p.id}
              href={`/verificacion/${p.id}`}
              className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr] items-center border-b border-background px-4 py-4 text-[13.5px] hover:bg-background"
            >
              <div className="flex items-center gap-2.5 font-semibold">
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-dark">
                  {p.nombre.slice(0, 2).toUpperCase()}
                </div>
                {p.nombre}
              </div>
              <div>
                <StatusChip label={p.tipo} tone="neutral" />
              </div>
              <div className="text-[#374151]">{p.ciudad}</div>
              <div className="text-[#374151]">{formatDate(p.fechaSolicitud)}</div>
              <div>
                <StatusChip
                  label={verificationLabel(p.estado)}
                  tone={toneForVerification(p.estado)}
                />
              </div>
            </Link>
          ))
        )}
      </Card>
    </>
  );
}
