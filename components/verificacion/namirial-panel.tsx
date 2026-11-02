import { StatusChip } from "@/components/ui/status-chip";
import { SyncIdentityButton } from "@/components/verificacion/sync-identity-button";
import { toneForNamirial } from "@/lib/status-tones";
import { namirialStatusLabel } from "@/lib/utils";

type Summary = {
  firstName: string | null;
  lastName: string | null;
  documentNumber: string | null;
  expiryDate: string | null;
  nationality: string | null;
  documentType: string | null;
  birthDate: string | null;
};

type Resource = {
  label: string;
  url: string | null;
  status: string | null;
  expiresAt: string | null;
};

export function NamirialPanel({
  workerId,
  identidad,
}: {
  workerId: string;
  identidad: {
    requestId: string;
    status: string;
    terminationReason: string | null;
    message: string | null;
    summary: Summary | null;
    resources: Resource[];
  } | null;
}) {
  return (
    <div className="mt-8 border-t border-background pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[15px] font-bold">Namirial Onboarding</div>
        {identidad ? (
          <StatusChip
            label={namirialStatusLabel(identidad.status)}
            tone={toneForNamirial(identidad.status)}
          />
        ) : null}
      </div>

      {!identidad ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay una captura de documento en Namirial.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Solicitud {identidad.requestId}
          </p>
          {identidad.message || identidad.terminationReason ? (
            <p className="text-sm text-destructive">
              {identidad.message ?? identidad.terminationReason}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" value={identidad.summary?.firstName} />
            <Field label="Apellidos" value={identidad.summary?.lastName} />
            <Field label="Documento" value={identidad.summary?.documentNumber} />
            <Field label="Tipo" value={identidad.summary?.documentType} />
            <Field label="Caducidad" value={identidad.summary?.expiryDate} />
            <Field label="Nacionalidad" value={identidad.summary?.nationality} />
            <Field label="Nacimiento" value={identidad.summary?.birthDate} />
          </div>

          <div>
            <div className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
              Evidencias
            </div>
            {identidad.resources.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay imágenes disponibles.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {identidad.resources.map((resource) =>
                  resource.url ? (
                    <a
                      key={`${resource.label}-${resource.url}`}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {resource.label}
                      {resource.status ? ` · ${resource.status}` : ""}
                    </a>
                  ) : (
                    <p
                      key={resource.label}
                      className="text-sm text-muted-foreground"
                    >
                      {resource.label}
                      {resource.status ? ` · ${resource.status}` : ""}
                    </p>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <SyncIdentityButton id={workerId} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium">{value?.trim() || "—"}</div>
    </div>
  );
}
