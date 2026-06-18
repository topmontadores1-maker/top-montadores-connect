import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useStore } from "@/mocks/store";
import { toast } from "sonner";

export function GlobalUpdateModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [pid, setPid] = useState<string>("");
  const [updatePhoto, setUpdatePhoto] = useState(false);
  const [updatePhone, setUpdatePhone] = useState(false);
  const [photo, setPhoto] = useState("");
  const [phone, setPhone] = useState("");

  const professionals = useStore((s) => s.professionals);
  const links = useStore((s) => s.links);
  const apply = useStore((s) => s.applyGlobalUpdate);

  const profLinks = useMemo(() => links.filter((l) => l.professionalId === pid), [links, pid]);

  const impact = useMemo(() => {
    let affected = 0;
    let excluded = 0;
    for (const l of profLinks) {
      const photoSkip = updatePhoto && l.photoOverride;
      const phoneSkip = updatePhone && l.whatsappOverride;
      const wouldUpdate = (updatePhoto && !photoSkip) || (updatePhone && !phoneSkip);
      if (wouldUpdate) affected++; else if (updatePhoto || updatePhone) excluded++;
    }
    return { affected, excluded, total: profLinks.length };
  }, [profLinks, updatePhoto, updatePhone]);

  function reset() {
    setStep(1); setPid(""); setUpdatePhoto(false); setUpdatePhone(false); setPhoto(""); setPhone("");
  }

  function confirm() {
    const patch: { photoUrl?: string; whatsapp?: string } = {};
    if (updatePhoto && photo) patch.photoUrl = photo;
    if (updatePhone && phone) patch.whatsapp = phone;
    const res = apply(pid, patch);
    toast.success(`Atualizado em ${res.affected} link(s). ${res.excluded} mantido(s) com exceção.`);
    setOpen(false); reset();
  }

  const canAdvance = pid && (updatePhoto || updatePhone) && (!updatePhoto || photo) && (!updatePhone || /^\d{12,13}$/.test(phone));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Atualização global</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Atualizar foto e/ou WhatsApp" : "Confirmar atualização"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Aplicado a todos os links sem exceção configurada."
              : `${impact.affected} de ${impact.total} links serão atualizados.`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <Label>Profissional</Label>
              <Select value={pid} onValueChange={setPid}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {professionals.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.linksCount} links)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 font-semibold text-sm">
                <Checkbox checked={updatePhoto} onCheckedChange={(c) => setUpdatePhoto(!!c)} /> Atualizar foto
              </label>
              {updatePhoto && <Input placeholder="URL da nova foto" value={photo} onChange={(e) => setPhoto(e.target.value)} />}
            </div>
            <div className="space-y-3 rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 font-semibold text-sm">
                <Checkbox checked={updatePhone} onCheckedChange={(c) => setUpdatePhone(!!c)} /> Atualizar WhatsApp
              </label>
              {updatePhone && <Input placeholder="5547999991111" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <div className="font-bold text-primary">{impact.affected} link(s) serão atualizados</div>
              <div className="text-xs text-muted-foreground">
                {impact.excluded} link(s) têm exceção configurada e não serão alterados.
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr><th className="px-3 py-2 text-left">Link</th><th className="px-3 py-2 text-left">Status</th></tr>
                </thead>
                <tbody>
                  {profLinks.slice(0, 20).map((l) => {
                    const photoSkip = updatePhoto && l.photoOverride;
                    const phoneSkip = updatePhone && l.whatsappOverride;
                    const skipped = (updatePhoto && photoSkip && !updatePhone) || (updatePhone && phoneSkip && !updatePhoto) || (updatePhoto && photoSkip && updatePhone && phoneSkip);
                    return (
                      <tr key={l.id} className="border-t border-border">
                        <td className="px-3 py-2 font-mono">{l.url}</td>
                        <td className="px-3 py-2">
                          {skipped
                            ? <span className="inline-flex items-center gap-1 text-warning-foreground"><AlertTriangle className="h-3 w-3" /> Exceção</span>
                            : <span className="text-success">Será atualizado</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button disabled={!canAdvance} onClick={() => setStep(2)}>Continuar</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={confirm}>Confirmar atualização</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
