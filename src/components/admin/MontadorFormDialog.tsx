import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { services } from "@/mocks/data";
import { useStore } from "@/mocks/store";
import { toast } from "sonner";

export function MontadorFormDialog() {
  const [open, setOpen] = useState(false);
  const add = useStore((s) => s.addProfessional);

  const [form, setForm] = useState({
    name: "", whatsapp: "", email: "", doc: "", photoUrl: "https://i.pravatar.cc/240",
    city: "", state: "", hours: "Seg a Sex, 9h às 18h", notes: "",
    status: "ativo" as "ativo" | "pausado" | "pendente",
    services: [] as string[],
  });

  function submit() {
    if (!form.name.trim()) return toast.error("Nome é obrigatório.");
    if (!/^\d{12,13}$/.test(form.whatsapp)) return toast.error("WhatsApp inválido (use 55DDD9XXXXXXXX).");
    if (form.state.length !== 2) return toast.error("UF deve ter 2 letras.");
    if (form.services.length === 0) return toast.error("Selecione ao menos 1 serviço.");
    add({ ...form, state: form.state.toUpperCase() });
    toast.success("Montador cadastrado.");
    setOpen(false);
    setForm({ ...form, name: "", whatsapp: "", email: "", doc: "", city: "", services: [] });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Novo montador</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Cadastrar novo montador</DialogTitle>
          <DialogDescription>Preencha os dados do profissional. Você poderá editar depois.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <Field label="Nome completo *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="WhatsApp * (apenas dígitos)" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v.replace(/\D/g, "") })} placeholder="5547999991111" />
          <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Documento" value={form.doc} onChange={(v) => setForm({ ...form, doc: v })} />
          <Field label="Foto (URL)" value={form.photoUrl} onChange={(v) => setForm({ ...form, photoUrl: v })} />
          <Field label="Horário" value={form.hours} onChange={(v) => setForm({ ...form, hours: v })} />
          <Field label="Cidade *" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="UF *" value={form.state} onChange={(v) => setForm({ ...form, state: v.toUpperCase().slice(0, 2) })} placeholder="SP" />
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: "ativo" | "pausado" | "pendente") => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Serviços atendidos *</Label>
          <div className="mt-2 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-border p-2">
            {services.map((s) => {
              const checked = form.services.includes(s.slug);
              return (
                <label key={s.slug} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) =>
                      setForm({
                        ...form,
                        services: c
                          ? [...form.services, s.slug]
                          : form.services.filter((x) => x !== s.slug),
                      })
                    }
                  />
                  {s.name}
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <Label>Observações</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit}>Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
