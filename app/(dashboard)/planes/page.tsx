import { fetchPlans } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { PlansManager } from "@/components/planes/plans-manager";

export default async function PlanesPage() {
  const result = await fetchPlans();

  return (
    <>
      <PageTitle title="Planes de suscripción" />
      {result.error ? (
        <p className="text-sm text-destructive">{result.error.message}</p>
      ) : (
        <PlansManager initial={result.data ?? []} />
      )}
    </>
  );
}
