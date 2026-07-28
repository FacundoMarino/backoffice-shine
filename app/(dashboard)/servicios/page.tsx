import { fetchServices } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { ServicesManager } from "@/components/servicios/services-manager";

export default async function ServiciosPage() {
  const result = await fetchServices();

  return (
    <>
      <PageTitle title="Servicios" />
      <Card className="p-6">
        {result.error ? (
          <p className="text-sm text-destructive">{result.error.message}</p>
        ) : (
          <ServicesManager initial={result.data ?? []} />
        )}
      </Card>
    </>
  );
}
