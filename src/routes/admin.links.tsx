import { createFileRoute } from "@tanstack/react-router";
import { publicLinks, findProfessional } from "@/mocks/data";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/links")({
  head: () => ({ meta: [{ title: "Links e Cobertura — Admin" }] }),
  component: Links,
});

function Links() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Links e Cobertura</h1>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Serviço</th>
              <th className="px-4 py-3 text-left">Cidade/UF</th>
              <th className="px-4 py-3 text-left">Responsável</th>
              <th className="px-4 py-3 text-left">URL</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Cliques</th>
            </tr>
          </thead>
          <tbody>
            {publicLinks.map((l) => {
              const p = findProfessional(l.professionalId);
              return (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{l.serviceName}</td>
                  <td className="px-4 py-3">{l.city}, {l.state}</td>
                  <td className="px-4 py-3">{p?.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.url}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="border-success/30 bg-success/15 text-success">{l.status}</Badge></td>
                  <td className="px-4 py-3">{l.clicks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
