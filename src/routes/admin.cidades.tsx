import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getCities, getProfessionals } from "@/lib/supabase-queries";
import type { City, Professional } from "@/integrations/supabase/database.types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cidades")({
  head: () => ({ meta: [{ title: "Cidades — Admin" }] }),
  component: Cidades,
});

function Cidades() {
  const [cities, setCities] = useState<City[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCities(), getProfessionals()])
      .then(([cityRows, professionalRows]) => {
        setCities(cityRows);
        setProfessionals(professionalRows);
      })
      .catch((error) => {
        console.error("Error loading cities:", error);
        toast.error("Erro ao carregar cidades.");
      })
      .finally(() => setLoading(false));
  }, []);

  const professionalNames = useMemo(
    () => new Map(professionals.map((professional) => [professional.id, professional.name])),
    [professionals],
  );

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
            {loading && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Carregando cidades...</td></tr>
            )}
            {cities.map((c) => {
              const professionalName = c.professional_id ? professionalNames.get(c.professional_id) : null;
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{c.city}</td>
                  <td className="px-4 py-3">{c.state}</td>
                  <td className="px-4 py-3">{professionalName ?? <em className="text-muted-foreground">sem responsável</em>}</td>
                  <td className="px-4 py-3">
                    {professionalName
                      ? <Badge variant="outline" className="border-success/30 bg-success/15 text-success">coberta</Badge>
                      : <Badge variant="outline" className="border-warning/40 bg-warning/20 text-warning-foreground">pendente</Badge>}
                  </td>
                </tr>
              );
            })}
            {!loading && cities.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhuma cidade cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
