import { fetchClients, fetchWorkers } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { UsersTabs } from "@/components/usuarios/users-tabs";
import { BanButton } from "@/components/usuarios/ban-button";
import { toneForAccount, toneForVerification } from "@/lib/status-tones";
import {
  accountStatusLabel,
  formatDate,
  subscriptionLabel,
  verificationLabel,
} from "@/lib/utils";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function UsuariosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = sp.tab === "clientes" ? "clientes" : "trabajadores";

  const [workersRes, clientsRes] = await Promise.all([
    fetchWorkers(),
    fetchClients(),
  ]);

  return (
    <>
      <PageTitle title="Usuarios" />
      <Card className="p-6">
        <UsersTabs active={tab} />

        {tab === "trabajadores" ? (
          <>
            <div className="mt-5 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] border-b border-[var(--sidebar-border)] px-4 pb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <div>Nombre</div>
              <div>Tipo</div>
              <div>Ciudad</div>
              <div>Verificación</div>
              <div>Suscripción</div>
              <div>Rating</div>
              <div />
            </div>
            {workersRes.error ? (
              <p className="py-8 text-center text-sm text-destructive">
                {workersRes.error.message}
              </p>
            ) : (
              (workersRes.data ?? []).map((w) => (
                <div
                  key={w.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] items-center border-b border-background px-4 py-4 text-[13.5px]"
                >
                  <div className="font-semibold">{w.nombre}</div>
                  <div>
                    <StatusChip label={w.tipo} />
                  </div>
                  <div>{w.ciudad}</div>
                  <div>
                    <StatusChip
                      label={
                        w.accountStatus === "BANNED"
                          ? "Baneado"
                          : verificationLabel(w.verificationStatus)
                      }
                      tone={
                        w.accountStatus === "BANNED"
                          ? "danger"
                          : toneForVerification(w.verificationStatus)
                      }
                    />
                  </div>
                  <div>
                    <StatusChip
                      label={subscriptionLabel(w.subscriptionStatus)}
                      tone={
                        w.subscriptionStatus === "ACTIVE" ? "success" : "neutral"
                      }
                    />
                  </div>
                  <div>{w.rating > 0 ? w.rating.toFixed(1) : "—"}</div>
                  <BanButton
                    userId={w.userId}
                    nombre={w.nombre}
                    banned={w.accountStatus === "BANNED"}
                  />
                </div>
              ))
            )}
          </>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_auto] border-b border-[var(--sidebar-border)] px-4 pb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <div>Nombre</div>
              <div>Correo</div>
              <div>Ciudad</div>
              <div>Alta</div>
              <div>Reseñas</div>
              <div>Estado</div>
              <div />
            </div>
            {clientsRes.error ? (
              <p className="py-8 text-center text-sm text-destructive">
                {clientsRes.error.message}
              </p>
            ) : (
              (clientsRes.data ?? []).map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_auto] items-center border-b border-background px-4 py-4 text-[13.5px]"
                >
                  <div className="font-semibold">{c.nombre}</div>
                  <div className="truncate text-[#374151]">{c.email}</div>
                  <div>{c.ciudad}</div>
                  <div>{formatDate(c.fechaAlta)}</div>
                  <div>{c.cantidadResenas}</div>
                  <div>
                    <StatusChip
                      label={accountStatusLabel(c.accountStatus)}
                      tone={toneForAccount(c.accountStatus)}
                    />
                  </div>
                  <BanButton
                    userId={c.userId}
                    nombre={c.nombre}
                    banned={c.accountStatus === "BANNED"}
                  />
                </div>
              ))
            )}
          </>
        )}
      </Card>
    </>
  );
}
