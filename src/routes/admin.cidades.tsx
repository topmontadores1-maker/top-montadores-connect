import { createFileRoute } from "@tanstack/react-router";
import { cities, findProfessional } from "@/mocks/data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/cidades")({
  head: () => ({ meta: [{ title: "Cidades — Admin" }] }),
  component: Cidades,
});

function Cidades() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Cidades</h1>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Cidade</th>
              <th className="px-4 py-3 text-left">UF</th>
              <th className="px-4 py-3 text-left">Responsável</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => {
              const p = c.professionalId ? findProfessional(c.professionalId) : null;
              return (
                <tr key={c.slug} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{c.city}</td>
                  <td className="px-4 py-3">{c.state}</td>
                  <td className="px-4 py-3">{p?.name ?? <em className="text-muted-foreground">sem responsável</em>}</td>
                  <td className="px-4 py-3">
                    {p
                      ? <Badge variant="outline" className="border-success/30 bg-success/15 text-success">coberta</Badge>
                      : <Badge variant="outline" className="border-warning/40 bg-warning/20 text-warning-foreground">pendente</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
