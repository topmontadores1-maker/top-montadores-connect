import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight, AlertTriangle } from "lucide-react";
import {
  getProfessionals,
  getPublicLinks,
  getServices,
  replaceProfessionalInLinks,
} from "@/lib/supabase-queries";
import type { Professional, PublicLink, Service } from "@/integrations/supabase/database.types";
import { logAction } from "@/lib/audit";
import { toast } from "sonner";

type ProfessionalWithServices = Professional & {
  professional_services: Array<{ service_slug: string }>;
};

export function ReplaceProfessionalModal() {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [city, setCity] = useState("all");
  const [service, setService] = useState("all");
  const [professionals, setProfessionals] = useState<ProfessionalWithServices[]>([]);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    Promise.all([getProfessionals(), getPublicLinks(), getServices()])
      .then(([professionalRows, linkRows, serviceRows]) => {
        setProfessionals(professionalRows as ProfessionalWithServices[]);
        setLinks(linkRows);
        setServices(serviceRows);
      })
      .catch((error) => {
        console.error("Error loading replacement data:", error);
        toast.error("Erro ao carregar profissionais e links.");
      });
  }, [open]);

  const toPro = professionals.find((p) => p.id === to);

  const candidate = useMemo(
    () =>
      links.filter((l) => {
        if (l.professional_id !== from) return false;
        if (city !== "all" && l.city_slug !== city) return false;
        if (service !== "all" && l.service_slug !== service) return false;
        return true;
      }),
    [links, from, city, service],
  );

  const fromLinks = links.filter((l) => l.professional_id === from);
  const fromCities = Array.from(new Set(fromLinks.map((l) => l.city_slug)));
  const fromServices = Array.from(new Set(fromLinks.map((l) => l.service_slug)));

  function reset() {
    setFrom("");
    setTo("");
    setCity("all");
    setService("all");
  }

  async function confirm() {
    if (!from || !to || from === to) return toast.error("Selecione profissionais distintos.");
    setSubmitting(true);
    try {
      const transferred = await replaceProfessionalInLinks(from, to, {
        citySlug: city === "all" ? undefined : city,
        serviceSlug: service === "all" ? undefined : service,
      });
      const fromName = professionals.find((professional) => professional.id === from)?.name || from;
      const toName = professionals.find((professional) => professional.id === to)?.name || to;
      await logAction(
        `Substituiu profissional em ${transferred} links`,
        `${fromName} -> ${toName}`,
      );
      toast.success(`${transferred} link(s) transferido(s). URLs preservadas.`);
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Error replacing professional:", error);
      toast.error("Erro ao substituir profissional.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowLeftRight className="h-4 w-4" /> Substituir profissional
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Substituir profissional em links</DialogTitle>
          <DialogDescription>
            As URLs permanecem inalteradas. Apenas o profissional vinculado é substituído. A ação é
            auditada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-w-0 gap-4 md:grid-cols-2 [&>*]:min-w-0">
          <div>
            <Label>Profissional atual (origem)</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({links.filter((link) => link.professional_id === p.id).length} links)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Novo profissional (destino)</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {professionals
                  .filter((p) => p.id !== from)
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Filtrar por cidade</Label>
            <Select value={city} onValueChange={setCity} disabled={!from}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {fromCities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Filtrar por serviço</Label>
            <Select value={service} onValueChange={setService} disabled={!from}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {fromServices.map((s) => {
                  const sv = services.find((x) => x.slug === s);
                  return (
                    <SelectItem key={s} value={s}>
                      {sv?.name ?? s}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {from && to && (
          <div className="space-y-2">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <strong>{candidate.length}</strong> link(s) serão transferidos. URLs preservadas.
            </div>
            {toPro &&
              candidate.some(
                (l) =>
                  !toPro.professional_services.some((item) => item.service_slug === l.service_slug),
              ) && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    O destino não cobre todos os serviços dos links selecionados. A substituição
                    prossegue, mas revise a cobertura depois.
                  </span>
                </div>
              )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!from || !to || candidate.length === 0 || submitting} onClick={confirm}>
            {submitting ? "Substituindo..." : "Confirmar substituição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
