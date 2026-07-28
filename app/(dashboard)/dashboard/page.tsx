import {
  CheckCircle2,
  Clock3,
  DollarSign,
  Scale,
  Users,
} from "lucide-react";

import { fetchDashboard } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const result = await fetchDashboard();
  const data = result.data;

  const kpis = data
    ? [
        {
          value: String(data.kpis.pendingVerifications),
          label: "Perfiles pendientes de aprobación",
          icon: Clock3,
          wrap: "bg-[#FFF6D8] text-[#8a6d00]",
        },
        {
          value: String(data.kpis.totalUsers),
          label: "Usuarios totales",
          sub: `${data.kpis.clientsCount} clientes · ${data.kpis.workersCount} trabajadores`,
          icon: Users,
          wrap: "bg-[#E7EFF4] text-[#3d6a82]",
        },
        {
          value: `$${data.kpis.mrr.toLocaleString("es-AR")}`,
          label: "Ingresos por suscripciones (MRR)",
          icon: DollarSign,
          wrap: "bg-[#E9F7F0] text-[#237a4e]",
        },
        {
          value: `${data.kpis.approvalRate}%`,
          label: "Tasa de aprobación",
          icon: CheckCircle2,
          wrap: "bg-[#E7EFF4] text-[#3d6a82]",
        },
        {
          value: `${data.kpis.activeSubscriptions}/${data.kpis.inactiveSubscriptions}`,
          label: "Suscripciones activas / inactivas",
          icon: Scale,
          wrap: "bg-[#EEF1F4] text-[#4b5563]",
        },
      ]
    : [];

  const maxBar = Math.max(1, ...(data?.weeklyBars.map((b) => b.value) ?? [1]));

  return (
    <>
      <PageTitle title="Dashboard" />
      {result.error ? (
        <Card>
          <p className="text-sm text-destructive">{result.error.message}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="flex flex-col gap-3 p-5">
                  <div
                    className={`flex h-[38px] w-[38px] items-center justify-center rounded-full ${kpi.wrap}`}
                  >
                    <Icon size={20} strokeWidth={1.9} />
                  </div>
                  <div className="text-[26px] font-extrabold leading-none">
                    {kpi.value}
                  </div>
                  <div className="text-[12.5px] font-medium leading-snug text-muted-foreground">
                    {kpi.label}
                  </div>
                  {"sub" in kpi && kpi.sub ? (
                    <div className="text-[11.5px] font-medium text-[#9AA4B2]">
                      {kpi.sub}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>

          <Card className="mt-5 p-7">
            <div className="mb-5 text-[15px] font-bold">
              Altas de trabajadores por semana
            </div>
            <div className="flex h-[180px] items-end gap-4 px-1.5">
              {(data?.weeklyBars ?? []).map((bar) => (
                <div
                  key={bar.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="text-xs font-semibold text-[#374151]">
                    {bar.value}
                  </div>
                  <div
                    className="w-full max-w-[48px] rounded-t-lg bg-primary"
                    style={{
                      height: `${Math.max(8, (bar.value / maxBar) * 140)}px`,
                    }}
                  />
                  <div className="text-[11px] font-medium text-[#9AA4B2]">
                    {bar.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
