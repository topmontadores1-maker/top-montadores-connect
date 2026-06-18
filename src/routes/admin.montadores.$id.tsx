import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { findProfessional, findServiceBySlug, publicLinks } from "@/mocks/data";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { StatusBadge } from "./admin.montadores";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/montadores/$id")({
  head: ({ params }) => ({ meta: [{ title: `Montador #${params.id} — Admin` }] }),
  component: MontadorDetail,
});

function MontadorDetail() {
  const { id } = useParams({ from: "/admin/montadores/$id" });
  const p = findProfessional(id);

  if (!p) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <h2 className="text-lg font-bold">Montador não encontrado</h2>
        <Button asChild className="mt-4"><Link to="/admin/montadores">Voltar</Link></Button>
      </div>
    );
  }

  const links = publicLinks.filter((l) => l.professionalId === p.id);

  return (
    <div className="space-y-6">
      <Link to="/admin/montadores" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <header className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5">
        <img src={p.photoUrl} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black">{p.name}</h1>
            <StatusBadge status={p.status} />
          </div>
          <div className="text-sm text-muted-foreground">{p.city}, {p.state} · {p.whatsapp}</div>
        </div>
        <Badge variant="secondary">{p.linksCount} links</Badge>
      </header>

      <Tabs defaultValue="dados">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dados">Dados gerais</TabsTrigger>
          <TabsTrigger value="cobertura">Cobertura e serviços</TabsTrigger>
          <TabsTrigger value="links">Links públicos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome" defaultValue={p.name} />
            <Field label="WhatsApp" defaultValue={p.whatsapp} />
            <Field label="E-mail" defaultValue={p.email ?? ""} />
            <Field label="Documento" defaultValue={p.doc ?? ""} />
            <Field label="Cidade base" defaultValue={p.city} />
            <Field label="UF" defaultValue={p.state} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea defaultValue={p.notes ?? ""} rows={3} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => toast.success("Dados salvos.")}>Salvar alterações</Button>
          </div>
        </TabsContent>

        <TabsContent value="cobertura" className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <Label>Serviços atendidos</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.services.map((s) => {
                const sv = findServiceBySlug(s);
                return (
                  <Badge key={s} variant="secondary" className="rounded-full px-3 py-1">
                    {sv?.name ?? s}
                  </Badge>
                );
              })}
              <Button variant="outline" size="sm">+ Adicionar serviço</Button>
            </div>
          </div>
          <div>
            <Label>Cidades atendidas</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">{p.city}, {p.state}</Badge>
              <Button variant="outline" size="sm">+ Adicionar cidade</Button>
            </div>
          </div>
          <Field label="Horário de atendimento" defaultValue={p.hours} />
        </TabsContent>

        <TabsContent value="links" className="rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Serviço</th>
                <th className="px-4 py-3 text-left">Cidade</th>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-left">Cliques</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{l.serviceName}</td>
                  <td className="px-4 py-3">{l.city}, {l.state}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.url}</td>
                  <td className="px-4 py-3">{l.clicks}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Link copiado.")}><Copy className="h-4 w-4" /></Button>
                    <Button asChild size="sm" variant="ghost"><a href={l.url}><ExternalLink className="h-4 w-4" /></a></Button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Sem links públicos.</td></tr>}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="historico" className="rounded-xl border border-border bg-card p-5">
          <ol className="relative space-y-4 border-l-2 border-border pl-5">
            {[
              { at: "2026-06-18 09:42", what: "WhatsApp atualizado" },
              { at: "2026-06-10 11:20", what: "Adicionado serviço Suportes e Prateleiras" },
              { at: "2026-05-30 14:00", what: "Cobertura estendida para Itajaí, SC" },
              { at: "2026-05-12 10:05", what: "Cadastro criado" },
            ].map((h) => (
              <li key={h.at} className="relative">
                <span className="absolute -left-[26px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary" />
                <div className="text-sm font-semibold">{h.what}</div>
                <div className="text-xs text-muted-foreground">{h.at}</div>
              </li>
            ))}
          </ol>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}
