import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  getAuditLogsByTarget,
  getProfessional,
  getPublicLinksByProfessional,
  getServices,
  syncProfessionalPublicLinks,
  updateProfessional,
  updateProfessionalServices,
  updatePublicLink,
} from "@/lib/supabase-queries";
import type {
  AuditLog,
  Professional,
  ProfessionalPortfolioItem,
  PublicLink,
  Service,
} from "@/integrations/supabase/database.types";
import { auditActions } from "@/lib/audit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Copy, ExternalLink, PauseCircle, Pencil, PlayCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MontadorFormDialog } from "@/components/admin/MontadorFormDialog";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";

type ProfessionalDetail = Professional & {
  professional_services: Array<{ service_slug: string }>;
  professional_portfolio_items: ProfessionalPortfolioItem[];
};

export const Route = createFileRoute("/admin/montadores/$id")({
  head: ({ params }) => ({ meta: [{ title: `Montador #${params.id} — Admin` }] }),
  component: MontadorDetail,
});

function MontadorDetail() {
  const { id } = useParams({ from: "/admin/montadores/$id" });
  const [p, setProfessional] = useState<ProfessionalDetail | null>(null);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    doc: "",
    city: "",
    state: "",
    notes: "",
    hours: "",
    neighborhoods: "",
    status: "pendente" as Professional["status"],
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [professional, publicLinks, serviceRows] = await Promise.all([
          getProfessional(id),
          getPublicLinksByProfessional(id),
          getServices(),
        ]);
        if (!active) return;
        setProfessional(professional as ProfessionalDetail | null);
        setLinks(publicLinks);
        setServices(serviceRows);
        if (professional) {
          setForm({
            name: professional.name,
            whatsapp: professional.whatsapp,
            email: professional.email || "",
            doc: professional.doc || "",
            city: professional.city,
            state: professional.state,
            notes: professional.notes || "",
            hours: professional.hours || "",
            neighborhoods: professional.neighborhoods.join(", "),
            status: professional.status,
          });
          setSelectedServices(professional.professional_services.map((item) => item.service_slug));
          setAudit(await getAuditLogsByTarget(professional.name));
        }
      } catch (error) {
        console.error("Error loading professional:", error);
        toast.error("Erro ao carregar montador.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const serviceNames = useMemo(
    () => new Map(services.map((service) => [service.slug, service.name])),
    [services],
  );

  function handleDialogSaved(saved: Professional, serviceSlugs: string[]) {
    if (!p) return;
    setProfessional({
      ...p,
      ...saved,
      professional_services: serviceSlugs.map((serviceSlug) => ({ service_slug: serviceSlug })),
    });
    setSelectedServices(serviceSlugs);
    setForm({
      name: saved.name,
      whatsapp: saved.whatsapp,
      email: saved.email || "",
      doc: saved.doc || "",
      city: saved.city,
      state: saved.state,
      notes: saved.notes || "",
      hours: saved.hours || "",
      neighborhoods: saved.neighborhoods.join(", "),
      status: saved.status,
    });
    void getPublicLinksByProfessional(saved.id).then(setLinks);
    void getProfessional(saved.id).then((refreshed) => {
      if (refreshed) setProfessional(refreshed);
    });
  }

  async function saveProfessional() {
    if (!p) return;
    if (!form.name.trim()) return toast.error("Nome é obrigatório.");
    if (!/^\d{12,13}$/.test(form.whatsapp))
      return toast.error("WhatsApp inválido (use 55DDD9XXXXXXXX).");
    if (!form.city.trim()) return toast.error("Cidade é obrigatória.");
    if (form.state.trim().length !== 2) return toast.error("UF deve ter 2 letras.");
    if (selectedServices.length === 0) return toast.error("Selecione ao menos um serviço.");
    if (
      form.status === "ativo" &&
      !(p.postal_code && p.street && p.address_number && p.neighborhood)
    ) {
      return toast.error("Use 'Editar cadastro' e complete o endereço antes de ativar o montador.");
    }

    setSaving(true);
    try {
      const updated = await updateProfessional(p.id, {
        name: form.name.trim(),
        whatsapp: form.whatsapp,
        email: form.email || null,
        doc: form.doc || null,
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        notes: form.notes || null,
        hours: form.hours || null,
        neighborhoods: form.neighborhoods
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: form.status,
      });
      const savedServices = await updateProfessionalServices(p.id, selectedServices);
      await syncProfessionalPublicLinks(updated, savedServices);
      setProfessional({
        ...p,
        ...updated,
        professional_services: savedServices.map((serviceSlug) => ({ service_slug: serviceSlug })),
      });
      await auditActions.updateProfessional(updated.name, "dados cadastrais");
      setAudit(await getAuditLogsByTarget(updated.name));
      toast.success("Dados salvos.");
    } catch (error) {
      console.error("Error updating professional:", error);
      toast.error("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePause() {
    if (!p) return;
    const status = p.status === "pausado" ? "ativo" : "pausado";
    if (
      status === "ativo" &&
      !(p.postal_code && p.street && p.address_number && p.neighborhood && p.city && p.state)
    ) {
      return toast.error("Complete o endereço em 'Editar cadastro' antes de reativar o montador.");
    }
    try {
      const updated = await updateProfessional(p.id, { status });
      await syncProfessionalPublicLinks(
        updated,
        p.professional_services.map((item) => item.service_slug),
      );
      setProfessional({ ...p, ...updated });
      setForm((current) => ({ ...current, status }));
      await (status === "pausado"
        ? auditActions.pauseProfessional(p.name)
        : auditActions.resumeProfessional(p.name));
      toast.success("Status atualizado.");
    } catch (error) {
      console.error("Error updating professional status:", error);
      toast.error("Erro ao atualizar status.");
    }
  }

  async function removeOverride(linkId: string, field: "photo_override" | "whatsapp_override") {
    try {
      const updated = await updatePublicLink(linkId, { [field]: null });
      setLinks((current) => current.map((link) => (link.id === linkId ? updated : link)));
      toast.success(
        field === "photo_override" ? "Exceção de foto removida." : "Exceção de WhatsApp removida.",
      );
    } catch (error) {
      console.error("Error removing link override:", error);
      toast.error("Erro ao remover exceção.");
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        Carregando montador...
      </div>
    );
  }

  if (!p) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <h2 className="text-lg font-bold">Montador não encontrado</h2>
        <Button asChild className="mt-4">
          <Link to="/admin/montadores">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/montadores"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <header className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5">
        <img
          src={p.photo_url || "/placeholder.svg"}
          alt={p.name}
          loading="lazy"
          decoding="async"
          className="h-16 w-16 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black">{p.name}</h1>
            <StatusBadge status={p.status} />
          </div>
          <div className="text-sm text-muted-foreground">
            {p.city}, {p.state} · {p.whatsapp}
          </div>
        </div>
        <Badge variant="secondary">{links.length} links</Badge>
        <MontadorFormDialog
          professional={{
            ...p,
            services: p.professional_services.map((item) => item.service_slug),
            portfolio: p.professional_portfolio_items,
          }}
          onSaved={handleDialogSaved}
          trigger={
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" /> Editar cadastro
            </Button>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              {p.status === "pausado" ? (
                <>
                  <PlayCircle className="h-4 w-4" /> Reativar
                </>
              ) : (
                <>
                  <PauseCircle className="h-4 w-4" /> Pausar
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {p.status === "pausado" ? "Reativar" : "Pausar"} {p.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {p.status === "pausado"
                  ? "O profissional voltará a aparecer nos links públicos."
                  : "Os links continuarão existindo, mas exibirão aviso de profissional indisponível. Nenhum dado histórico é apagado."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={togglePause}>Confirmar</AlertDialogAction>
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

        <TabsContent
          value="dados"
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(v) => setForm({ ...form, whatsapp: v.replace(/\D/g, "") })}
            />
            <Field
              label="E-mail"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              label="Documento"
              value={form.doc}
              onChange={(v) => setForm({ ...form, doc: v })}
            />
            <Field
              label="Cidade base"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
            />
            <Field
              label="UF"
              value={form.state}
              onChange={(v) => setForm({ ...form, state: v.toUpperCase().slice(0, 2) })}
            />
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(status: Professional["status"]) => setForm({ ...form, status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveProfessional} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent
          value="cobertura"
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >
          <div>
            <Label>Serviços atendidos</Label>
            <div className="mt-2 grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const checked = selectedServices.includes(service.slug);
                return (
                  <label key={service.slug} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        setSelectedServices((current) =>
                          value
                            ? [...current, service.slug]
                            : current.filter((slug) => slug !== service.slug),
                        )
                      }
                    />
                    {service.name}
                  </label>
                );
              })}
            </div>
          </div>
          <Field
            label="Horário de atendimento"
            value={form.hours}
            onChange={(v) => setForm({ ...form, hours: v })}
          />
          <Field
            label="Bairros atendidos (separados por vírgula)"
            value={form.neighborhoods}
            onChange={(v) => setForm({ ...form, neighborhoods: v })}
          />
          <div className="flex justify-end">
            <Button onClick={saveProfessional} disabled={saving}>
              {saving ? "Salvando..." : "Salvar cobertura"}
            </Button>
          </div>
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
                  <td className="px-4 py-3 font-semibold">
                    {serviceNames.get(l.service_slug) || l.service_slug}
                  </td>
                  <td className="px-4 py-3">
                    {l.city}, {l.state}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.url}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {l.photo_override && (
                        <Badge
                          variant="outline"
                          className="cursor-pointer border-warning/40 bg-warning/10 text-warning-foreground"
                          onClick={() => removeOverride(l.id, "photo_override")}
                        >
                          Foto ×
                        </Badge>
                      )}
                      {l.whatsapp_override && (
                        <Badge
                          variant="outline"
                          className="cursor-pointer border-warning/40 bg-warning/10 text-warning-foreground"
                          onClick={() => removeOverride(l.id, "whatsapp_override")}
                        >
                          WhatsApp ×
                        </Badge>
                      )}
                      {!l.photo_override && !l.whatsapp_override && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{l.clicks}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard?.writeText(l.url);
                        toast.success("Link copiado.");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <a href={l.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Este montador ainda não tem links.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="historico" className="rounded-xl border border-border bg-card p-5">
          {audit.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Sem eventos registrados ainda.
            </div>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-border pl-5">
              {audit.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary" />
                  <div className="text-sm font-semibold">{h.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString("pt-BR")} · {h.user_id || "Sistema"}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
