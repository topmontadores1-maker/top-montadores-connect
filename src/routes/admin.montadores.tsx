import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { Professional } from "@/mocks/data";
import { services } from "@/mocks/data";
import { useStore } from "@/mocks/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Upload, PauseCircle, PlayCircle, X } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MontadorFormDialog } from "@/components/admin/MontadorFormDialog";
import { GlobalUpdateModal } from "@/components/admin/GlobalUpdateModal";
import { ReplaceProfessionalModal } from "@/components/admin/ReplaceProfessionalModal";

export const Route = createFileRoute("/admin/montadores")({
  head: () => ({ meta: [{ title: "Montadores — Admin" }] }),
  component: MontadoresList,
});

function MontadoresList() {
  const professionals = useStore((s) => s.professionals);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [state, setState] = useState("all");
  const [city, setCity] = useState("all");
  const [service, setService] = useState("all");

  const states = Array.from(new Set(professionals.map((p) => p.state))).sort();
  const cities = Array.from(new Set(professionals.map((p) => p.city))).sort();

  const rows = useMemo(() => {
    return professionals.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (state !== "all" && p.state !== state) return false;
      if (city !== "all" && p.city !== city) return false;
      if (service !== "all" && !p.services.includes(service)) return false;
      if (q && !`${p.name} ${p.whatsapp}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [professionals, q, status, state, city, service]);

  const hasFilters = q || status !== "all" || state !== "all" || city !== "all" || service !== "all";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Montadores</h1>
          <p className="text-sm text-muted-foreground">{rows.length} de {professionals.length} profissionais</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2"><Link to="/admin/importacoes"><Upload className="h-4 w-4" /> Importar planilha</Link></Button>
          <GlobalUpdateModal />
          <ReplaceProfessionalModal />
          <MontadorFormDialog />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou WhatsApp" className="pl-9" />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Cidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas cidades</SelectItem>
            {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos UFs</SelectItem>
            {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Serviço" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos serviços</SelectItem>
            {services.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setQ(""); setStatus("all"); setState("all"); setCity("all"); setService("all"); }}>
            <X className="mr-1 h-4 w-4" /> Limpar
          </Button>
        )}
      </div>

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
  const toggle = useStore((s) => s.togglePause);
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
          <Button asChild size="sm" variant="ghost" title="Ver detalhes">
            <Link to="/admin/montadores/$id" params={{ id: p.id }}><Eye className="h-4 w-4" /></Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" title={p.status === "pausado" ? "Reativar" : "Pausar"}>
                {p.status === "pausado" ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
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
                <AlertDialogAction onClick={() => { toggle(p.id); toast.success(p.status === "pausado" ? "Reativado." : "Pausado."); }}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
