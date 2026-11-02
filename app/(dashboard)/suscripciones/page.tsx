import { fetchPlans, fetchSubscriptions, fetchWorkers } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { SubscriptionsManager } from "@/components/suscripciones/subscriptions-manager";

type Props = {
  searchParams: Promise<{ status?: "NONE" | "ACTIVE" | "PAUSED"; planId?: string }>;
};

export default async function SuscripcionesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [subsRes, plansRes, workersRes] = await Promise.all([
    fetchSubscriptions({
      status: sp.status,
      planId: sp.planId,
    }),
    fetchPlans(),
    fetchWorkers(),
  ]);

  if (subsRes.error) {
    return (
      <>
        <PageTitle title="Suscripciones pagas" />
        <p className="text-sm text-destructive">{subsRes.error.message}</p>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Suscripciones pagas" />
      <SubscriptionsManager
        subscriptions={subsRes.data ?? []}
        workers={workersRes.data ?? []}
        plans={plansRes.data ?? []}
        filters={{ status: sp.status, planId: sp.planId }}
      />
    </>
  );
}
