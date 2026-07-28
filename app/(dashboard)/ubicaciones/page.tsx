import { fetchLocations } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { LocationsTree } from "@/components/ubicaciones/locations-tree";

export default async function UbicacionesPage() {
  const result = await fetchLocations();

  return (
    <>
      <PageTitle title="Ubicaciones" />
      <Card className="p-6">
        {result.error ? (
          <p className="text-sm text-destructive">{result.error.message}</p>
        ) : (
          <LocationsTree initial={result.data ?? []} />
        )}
      </Card>
    </>
  );
}
