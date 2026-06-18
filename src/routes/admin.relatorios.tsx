import { createFileRoute } from "@tanstack/react-router";
import { clicksSeries, stateBars } from "@/mocks/data";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Admin" }] }),
  component: Relatorios,
});

function Relatorios() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-black">Relatórios</h1>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar CSV</Button>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-bold">Cliques no WhatsApp</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={clicksSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="var(--primary)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-bold">Links por estado</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stateBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
              <XAxis dataKey="state" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
