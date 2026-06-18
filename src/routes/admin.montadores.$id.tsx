import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { findServiceBySlug } from "@/mocks/data";
import { useStore } from "@/mocks/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Copy, ExternalLink, PauseCircle, PlayCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/admin/montadores/$id")({
  head: ({ params }) => ({ meta: [{ title: `Montador #${params.id} — Admin` }] }),
  component: MontadorDetail,
});

function MontadorDetail() {
  const { id } = useParams({ from: "/admin/montadores/$id" });
  const p = useStore((s) => s.professionals.find((x) => x.id === id));
  const links = useStore((s) => s.links.filter((l) => l.professionalId === id));
  const audit = useStore((s) => s.audit.filter((a) => a.target === p?.name));
  const update = useStore((s) => s.updateProfessional);
  const togglePause = useStore((s) => s.togglePause);
  const removeOverride = useStore((s) => s.removeLinkOverride);

  const [form, setForm] = useState({
    name: p?.name ?? "", whatsapp: p?.whatsapp ?? "", email: p?.email ?? "",
    doc: p?.doc ?? "", city: p?.city ?? "", state: p?.state ?? "", notes: p?.notes ?? "",
    hours: p?.hours ?? "",
  });

  if (!p) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <h2 className="text-lg font-bold">Montador não encontrado</h2>
        <Button asChild className="mt-4"><Link to="/admin/montadores">Voltar</Link></Button>
      </div>
    );
  }

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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              {p.status === "pausado" ? <><PlayCircle className="h-4 w-4" /> Reativar</> : <><PauseCircle className="h-4 w-4" /> Pausar</>}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{p.status === "pausado" ? "Reativar" : "Pausar"} {p.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                {p.status === "pausado"
                  ? "O profissional voltará a aparecer nos links públicos."
                  : "Os links continuarão existindo, mas exibirão aviso de profissional indisponível. Nenhum dado histórico é apagado."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => { togglePause(p.id); toast.success("Status atualizado."); }}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <Tabs defaultValue="dados">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dados">Dados gerais</TabsTrigger>
          <TabsTrigger value="cobertura">Cobertura e serviços</TabsTrigger>
          <TabsTrigger value="links">Links públicos ({links.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
            <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Documento" value={form.doc} onChange={(v) => setForm({ ...form, doc: v })} />
            <Field label="Cidade base" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="UF" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => { update(p.id, form); toast.success("Dados salvos."); }}>Salvar alterações</Button>
          </div>
        </TabsContent>

        <TabsContent value="cobertura" className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div>
            <Label>Serviços atendidos</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.services.map((s) => {
                const sv = findServiceBySlug(s);
                return <Badge key={s} variant="secondary" className="rounded-full px-3 py-1">{sv?.name ?? s}</Badge>;
              })}
            </div>
          </div>
          <div>
            <Label>Cidade base</Label>
            <div className="mt-2"><Badge variant="secondary" className="rounded-full px-3 py-1">{p.city}, {p.state}</Badge></div>
          </div>
          <Field label="Horário de atendimento" value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} />
        </TabsContent>

        <TabsContent value="links" className="rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Serviço</th>
                <th className="px-4 py-3 text-left">Cidade</th>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-left">Exceções</th>
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
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {l.photoOverride && (
                        <Badge variant="outline" className="cursor-pointer border-warning/40 bg-warning/10 text-warning-foreground" onClick={() => { removeOverride(l.id, "photoOverride"); toast.success("Exceção de foto removida."); }}>
                          Foto ×
                        </Badge>
                      )}
                      {l.whatsappOverride && (
                        <Badge variant="outline" className="cursor-pointer border-warning/40 bg-warning/10 text-warning-foreground" onClick={() => { removeOverride(l.id, "whatsappOverride"); toast.success("Exceção de WhatsApp removida."); }}>
                          WhatsApp ×
                        </Badge>
                      )}
                      {!l.photoOverride && !l.whatsappOverride && <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">{l.clicks}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(l.url); toast.success("Link copiado."); }}><Copy className="h-4 w-4" /></Button>
                    <Button asChild size="sm" variant="ghost"><a href={l.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Este montador ainda não tem links.</td></tr>}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="historico" className="rounded-xl border border-border bg-card p-5">
          {audit.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Sem eventos registrados ainda.</div>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-border pl-5">
              {audit.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary" />
                  <div className="text-sm font-semibold">{h.what}</div>
                  <div className="text-xs text-muted-foreground">{h.at} · {h.who}</div>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
