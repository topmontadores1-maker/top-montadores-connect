import { createFileRoute } from "@tanstack/react-router";
import { services } from "@/mocks/data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Admin" }] }),
  component: Servicos,
});

function Servicos() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-black">Serviços</h1>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Novo serviço</Button>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.slug} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <div className="font-bold">{s.name}</div>
              <div className="font-mono text-xs text-muted-foreground">{s.slug}</div>
            </div>
            <Badge variant="outline" className="border-success/30 bg-success/15 text-success">ativo</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
