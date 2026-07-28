import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { fetchVerification } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { VerificationActions } from "@/components/verificacion/actions";
import { toneForVerification } from "@/lib/status-tones";
import { verificationLabel } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default async function VerificacionDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await fetchVerification(id);

  if (result.error || !result.data) {
    return (
      <>
        <PageTitle title="Verificación de perfiles" />
        <Card>
          <p className="text-sm text-destructive">
            {result.error?.message ?? "Perfil no encontrado"}
          </p>
          <Link href="/verificacion" className="mt-4 inline-block text-sm text-primary">
            Volver a la lista
          </Link>
        </Card>
      </>
    );
  }

  const p = result.data;
  const availability = p.availability as {
    weekdays?: string[];
  } | null;
  const weekdayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const activeDays = new Set(
    (availability?.weekdays ?? []).map((d) => d.toLowerCase()),
  );

  return (
    <>
      <PageTitle title="Verificación de perfiles" />
      <Link
        href="/verificacion"
        className="mb-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-muted-foreground"
      >
        <ChevronLeft size={16} />
        Volver a la lista
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xl font-bold text-primary-dark">
              {p.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-bold">{p.nombre}</div>
              <StatusChip label={p.tipo} />
            </div>
            <div className="ml-auto">
              <StatusChip
                label={verificationLabel(p.estado)}
                tone={toneForVerification(p.estado)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-background pt-4">
            <Field label="Teléfono" value={p.telefono ?? "—"} />
            <Field label="Años de experiencia" value={p.anios ? `${p.anios} años` : "—"} />
            <Field
              label="Tarifa"
              value={p.tarifa != null ? `$${p.tarifa}/hora` : "—"}
            />
            <Field label="Zona de trabajo" value={p.zona} />
          </div>

          <div>
            <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Bio
            </div>
            <p className="text-sm leading-relaxed text-[#374151]">
              {p.bio ?? "Sin descripción"}
            </p>
          </div>

          <div>
            <div className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Servicios
            </div>
            <div className="flex flex-wrap gap-2">
              {p.servicios.length === 0 ? (
                <span className="text-sm text-muted-foreground">Sin servicios</span>
              ) : (
                p.servicios.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-black"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Disponibilidad
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((label, i) => {
                const on = activeDays.has(weekdayKeys[i]);
                return (
                  <span
                    key={label}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      on
                        ? "border-primary bg-primary text-black"
                        : "border-border bg-white text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {p.estado === "PENDING" ? <VerificationActions id={p.id} /> : null}
          {p.rejectionReason ? (
            <p className="text-sm text-destructive">
              Motivo de rechazo: {p.rejectionReason}
            </p>
          ) : null}
        </Card>

        <Card className="p-7">
          <div className="mb-4 text-[15px] font-bold">Documentos de identidad</div>
          {p.documentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin documentos cargados</p>
          ) : (
            <div className="flex flex-col gap-3">
              {p.documentos.map((d) => (
                <a
                  key={d.id}
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-primary hover:underline"
                >
                  {d.docType} — {d.status}
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
