import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { professionals, type Professional } from "@/mocks/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, RefreshCw, ArrowLeftRight, MoreHorizontal, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/montadores")({
  head: () => ({ meta: [{ title: "Montadores — Admin" }] }),
  component: MontadoresList,
});

function MontadoresList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [state, setState] = useState<string>("all");

  const rows = useMemo(() => {
    return professionals.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (state !== "all" && p.state !== state) return false;
      if (q && !`${p.name} ${p.city} ${p.whatsapp}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status, state]);

  const states = Array.from(new Set(professionals.map((p) => p.state)));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Montadores</h1>
          <p className="text-sm text-muted-foreground">{rows.length} profissionais</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <GlobalUpdateModal />
          <ReplaceModal />
          <Button className="gap-2"><Plus className="h-4 w-4" /> Novo montador</Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, cidade ou WhatsApp" className="pl-9" />
        </div>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos estados</SelectItem>
            {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th>Profissional</Th>
              <Th>WhatsApp</Th>
              <Th>Cidade</Th>
              <Th>UF</Th>
              <Th>Links</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => <Row key={p.id} p={p} />)}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nenhum montador encontrado com esses filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((p) => (
          <Link key={p.id} to="/admin/montadores/$id" params={{ id: p.id }} className="block rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <img src={p.photoUrl} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{p.name}</div>
                <div className="truncate text-xs text-muted-foreground">{p.city}, {p.state}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{p.whatsapp}</span>
              <span>{p.linksCount} links</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Row({ p }: { p: Professional }) {
  return (
    <tr className="border-t border-border">
      <Td>
        <div className="flex items-center gap-3">
          <img src={p.photoUrl} alt={p.name} className="h-9 w-9 rounded-md object-cover" />
          <span className="font-semibold">{p.name}</span>
        </div>
      </Td>
      <Td className="font-mono text-xs">{p.whatsapp}</Td>
      <Td>{p.city}</Td>
      <Td>{p.state}</Td>
      <Td>{p.linksCount}</Td>
      <Td><StatusBadge status={p.status} /></Td>
      <Td className="text-right">
        <div className="inline-flex gap-1">
          <Button asChild size="sm" variant="ghost">
            <Link to="/admin/montadores/$id" params={{ id: p.id }}><Eye className="h-4 w-4" /></Link>
          </Button>
          <Button size="sm" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </Td>
    </tr>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

export function StatusBadge({ status }: { status: Professional["status"] }) {
  const map: Record<Professional["status"], string> = {
    ativo: "bg-success/15 text-success border-success/30",
    pendente: "bg-warning/20 text-warning-foreground border-warning/40",
    inativo: "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={`capitalize ${map[status]}`}>{status}</Badge>;
}

function GlobalUpdateModal() {
  const [phone, setPhone] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Atualização global</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar foto e WhatsApp</DialogTitle>
          <DialogDescription>
            Aplicado em <strong>todos os links públicos</strong> do profissional selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Profissional</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {professionals.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nova foto</Label>
            <Input type="file" accept="image/*" />
          </div>
          <div>
            <Label>Novo WhatsApp</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="55DDD9XXXXXXXX" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Atualização aplicada em todos os links.")}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReplaceModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><ArrowLeftRight className="h-4 w-4" /> Substituir profissional</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Substituir profissional em todos os links</DialogTitle>
          <DialogDescription>
            Todos os links públicos do profissional atual serão transferidos para o novo profissional.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Profissional atual</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {professionals.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.linksCount} links)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Novo profissional</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {professionals.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
            Impacto estimado: <strong>14 links</strong> em <strong>6 cidades</strong>.
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Substituição concluída.")}>Confirmar substituição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
