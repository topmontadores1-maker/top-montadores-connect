import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { createService, deleteService, getServices, updateService } from "@/lib/supabase-queries";
import type { Service } from "@/integrations/supabase/database.types";
import { auditActions } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Admin" }] }),
  component: Servicos,
});

type ServiceForm = {
  name: string;
  slug: string;
  icon: string;
  description: string;
};

const EMPTY_FORM: ServiceForm = {
  name: "",
  slug: "",
  icon: "Wrench",
  description: "",
};

function Servicos() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);

  const loadServices = useCallback(async () => {
    try {
      setServices(await getServices());
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Erro ao carregar serviços.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setForm({
      name: service.name,
      slug: service.slug,
      icon: service.icon,
      description: service.description || "",
    });
    setDialogOpen(true);
  }

  async function saveService() {
    const name = form.name.trim();
    const slug = form.slug.trim();
    const icon = form.icon.trim();
    const description = form.description.trim() || null;

    if (!name) return toast.error("Nome é obrigatório.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return toast.error("Slug inválido. Use apenas letras minúsculas, números e hífens.");
    }
    if (!icon) return toast.error("Ícone é obrigatório.");

    setSaving(true);
    try {
      if (editing) {
        const updated = await updateService(editing.slug, { name, icon, description });
        setServices((current) =>
          current.map((service) => (service.slug === updated.slug ? updated : service)),
        );
        await auditActions.updateService(updated.name);
        toast.success("Serviço atualizado.");
      } else {
        const created = await createService({ slug, name, icon, description });
        setServices((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        await auditActions.createService(created.name);
        toast.success("Serviço criado.");
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error(getServiceErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!serviceToDelete) return;
    setDeleting(true);
    try {
      await deleteService(serviceToDelete.slug);
      await auditActions.deleteService(serviceToDelete.name);
      setServices((current) => current.filter((service) => service.slug !== serviceToDelete.slug));
      toast.success("Serviço excluído.");
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Não foi possível excluir o serviço.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black">Serviços</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Serviços</h1>
          <p className="text-sm text-muted-foreground">{services.length} serviços cadastrados</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </header>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Nenhum serviço cadastrado.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.slug}
              className="flex min-h-32 flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div>
                <div className="font-bold">{service.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{service.slug}</div>
                {service.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => openEdit(service)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => setServiceToDelete(service)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar serviço" : "Novo serviço"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Altere os dados do serviço. O slug não pode ser modificado."
                : "Cadastre um serviço que poderá ser vinculado aos montadores."}
            </DialogDescription>
          </DialogHeader>
          <div className="min-w-0 space-y-4 py-2 [&>*]:min-w-0">
            <div>
              <Label htmlFor="service-name">Nome *</Label>
              <Input
                id="service-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: editing ? current.slug : slugify(event.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="service-slug">Slug *</Label>
              <Input
                id="service-slug"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })}
                readOnly={Boolean(editing)}
                className={editing ? "cursor-not-allowed bg-muted/60" : undefined}
              />
            </div>
            <div>
              <Label htmlFor="service-icon">Ícone *</Label>
              <Input
                id="service-icon"
                value={form.icon}
                onChange={(event) => setForm({ ...form, icon: event.target.value })}
                placeholder="Wrench"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use o nome de um ícone do Lucide, por exemplo: Hammer, Wrench ou Tv.
              </p>
            </div>
            <div>
              <Label htmlFor="service-description">Descrição</Label>
              <Textarea
                id="service-description"
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={saveService} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => !open && !deleting && setServiceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {serviceToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente e também removerá os vínculos deste serviço com montadores e
              links públicos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir serviço"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getServiceErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = String(error.code);
    if (code === "23505") return "Já existe um serviço com esse nome ou slug.";
    if (code === "42501") return "Sua conta não tem permissão para alterar serviços.";
  }
  return "Não foi possível salvar o serviço.";
}
