import { fetchReviews } from "@/actions/admin";
import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { ReviewActions } from "@/components/resenas/review-actions";
import { formatDate } from "@/lib/utils";

export default async function ResenasPage() {
  const result = await fetchReviews();
  const rows = result.data ?? [];

  return (
    <>
      <PageTitle title="Reseñas" />
      <Card className="p-6">
        <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr_2fr_0.8fr_0.8fr_auto] border-b border-[var(--sidebar-border)] px-4 pb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <div>Autor</div>
          <div>Trabajador</div>
          <div>Rating</div>
          <div>Comentario</div>
          <div>Fecha</div>
          <div>Estado</div>
          <div />
        </div>
        {result.error ? (
          <p className="py-8 text-center text-sm text-destructive">
            {result.error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#9AA4B2]">Sin reseñas</p>
        ) : (
          rows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1.2fr_1.2fr_0.6fr_2fr_0.8fr_0.8fr_auto] items-center gap-2 border-b border-background px-4 py-4 text-[13.5px]"
            >
              <div className="font-semibold">{r.autor}</div>
              <div>{r.trabajador}</div>
              <div>{r.calificacion.toFixed(1)}</div>
              <div className="line-clamp-2 text-[#374151]">
                {r.comentario ?? "—"}
              </div>
              <div>{formatDate(r.fecha)}</div>
              <div>
                <StatusChip
                  label={r.estado === "oculta" ? "Oculta" : "Visible"}
                  tone={r.estado === "oculta" ? "neutral" : "success"}
                />
              </div>
              <ReviewActions id={r.id} hidden={r.estado === "oculta"} />
            </div>
          ))
        )}
      </Card>
    </>
  );
}
