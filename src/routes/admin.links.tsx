import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicLinks, getProfessionals, getServices } from "@/lib/supabase-queries";
import type { PublicLink } from "@/integrations/supabase/database.types";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/links")({
  head: () => ({ meta: [{ title: "Links e Cobertura — Admin" }] }),
  component: Links,
});

function Links() {
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [professionals, setProfessionals] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPublicLinks(), getProfessionals(), getServices()])
      .then(([links, profs, svcs]) => {
        setLinks(links);
        // Create lookup maps
        const profMap = Object.fromEntries(profs.map((professional) => [professional.id, professional.name]));
        setProfessionals(profMap);

        const svcMap = Object.fromEntries(svcs.map((service) => [service.slug, service.name]));
        setServices(svcMap);
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Links e Cobertura</h1>
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted"></div>
            ))}
          </div>
        </div>
      ) : (
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
            {links.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold">{services[l.service_slug] || l.service_slug}</td>
                <td className="px-4 py-3">{l.city}, {l.state}</td>
                <td className="px-4 py-3">{professionals[l.professional_id]}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.url}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="border-success/30 bg-success/15 text-success">{l.status}</Badge></td>
                <td className="px-4 py-3">{l.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
