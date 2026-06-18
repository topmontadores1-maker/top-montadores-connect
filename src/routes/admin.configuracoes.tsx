import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Admin" }] }),
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Configurações</h1>

      <Section title="Marca">
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Nome da marca</Label><Input defaultValue="Top Montadores" /></div>
          <div><Label>Domínio</Label><Input defaultValue="topmontadores.com.br" /></div>
        </div>
      </Section>

      <Section title="Mensagem padrão de WhatsApp">
        <Textarea defaultValue="Olá! Vim do Top Montadores e preciso de um orçamento." rows={3} />
      </Section>

      <Section title="Integrações">
        <p className="text-sm text-muted-foreground">
          Nenhuma chave de API é exposta no frontend. Configure suas credenciais no servidor.
        </p>
      </Section>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Configurações salvas.")}>Salvar</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 font-bold">{title}</h3>
      {children}
    </div>
  );
}
