import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { getProfessionals, getPublicLinks, updateProfessional } from "@/lib/supabase-queries";
import type { Professional, PublicLink } from "@/integrations/supabase/database.types";
import { logAction } from "@/lib/audit";
import { toast } from "sonner";
import { removeProfessionalImages, uploadProfessionalImage } from "@/lib/image-storage";

export function GlobalUpdateModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [pid, setPid] = useState<string>("");
  const [updatePhoto, setUpdatePhoto] = useState(false);
  const [updatePhone, setUpdatePhone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [phone, setPhone] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    Promise.all([getProfessionals(), getPublicLinks()])
      .then(([professionalRows, linkRows]) => {
        setProfessionals(professionalRows);
        setLinks(linkRows);
      })
      .catch((error) => {
        console.error("Error loading global update data:", error);
        toast.error("Erro ao carregar profissionais e links.");
      });
  }, [open]);

  const profLinks = useMemo(() => links.filter((l) => l.professional_id === pid), [links, pid]);

  const impact = useMemo(() => {
    let affected = 0;
    let excluded = 0;
    for (const l of profLinks) {
      const photoSkip = updatePhoto && l.photo_override;
      const phoneSkip = updatePhone && l.whatsapp_override;
      const wouldUpdate = (updatePhoto && !photoSkip) || (updatePhone && !phoneSkip);
      if (wouldUpdate) affected++;
      else if (updatePhoto || updatePhone) excluded++;
    }
    return { affected, excluded, total: profLinks.length };
  }, [profLinks, updatePhoto, updatePhone]);

  function reset() {
    setStep(1);
    setPid("");
    setUpdatePhoto(false);
    setUpdatePhone(false);
    setPhotoFile(null);
    setPhone("");
  }

  async function confirm() {
    const patch: { photo_url?: string; whatsapp?: string } = {};
    if (updatePhone && phone) patch.whatsapp = phone;
    setSubmitting(true);
    let uploadedPhotoUrl: string | null = null;
    try {
      if (updatePhoto && photoFile) {
        const uploaded = await uploadProfessionalImage(
          photoFile,
          `professionals/${pid}/profile`,
          "profile",
        );
        uploadedPhotoUrl = uploaded.url;
        patch.photo_url = uploaded.url;
      }
      await updateProfessional(pid, patch);
      const previousPhoto = professionals.find(
        (professional) => professional.id === pid,
      )?.photo_url;
      if (uploadedPhotoUrl && previousPhoto) {
        await removeProfessionalImages([previousPhoto]).catch((error) => {
          console.error("Error removing previous global photo:", error);
        });
      }
      const fields = [updatePhoto ? "foto" : null, updatePhone ? "WhatsApp" : null]
        .filter(Boolean)
        .join(" e ");
      const professionalName =
        professionals.find((professional) => professional.id === pid)?.name || pid;
      await logAction(
        `Atualização global de ${fields} (${impact.affected} links)`,
        professionalName,
      );
      toast.success(
        `Atualizado em ${impact.affected} link(s). ${impact.excluded} mantido(s) com exceção.`,
      );
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Error applying global update:", error);
      if (uploadedPhotoUrl)
        await removeProfessionalImages([uploadedPhotoUrl]).catch(() => undefined);
      toast.error("Erro ao aplicar atualização global.");
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance =
    pid &&
    (updatePhoto || updatePhone) &&
    (!updatePhoto || photoFile) &&
    (!updatePhone || /^\d{12,13}$/.test(phone));

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
          <RefreshCw className="h-4 w-4" /> Atualização global
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Atualizar foto e/ou WhatsApp" : "Confirmar atualização"}
          </DialogTitle>
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
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({links.filter((link) => link.professional_id === p.id).length}{" "}
                      links)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 font-semibold text-sm">
                <Checkbox checked={updatePhoto} onCheckedChange={(c) => setUpdatePhoto(!!c)} />{" "}
                Atualizar foto
              </label>
              {updatePhoto && (
                <ImageUploadField
                  label="Nova foto"
                  file={photoFile}
                  onFileChange={setPhotoFile}
                  onRemove={() => setPhotoFile(null)}
                  disabled={submitting}
                />
              )}
            </div>
            <div className="space-y-3 rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 font-semibold text-sm">
                <Checkbox checked={updatePhone} onCheckedChange={(c) => setUpdatePhone(!!c)} />{" "}
                Atualizar WhatsApp
              </label>
              {updatePhone && (
                <Input
                  placeholder="5547999991111"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
              <div className="font-bold text-primary">
                {impact.affected} link(s) serão atualizados
              </div>
              <div className="text-xs text-muted-foreground">
                {impact.excluded} link(s) têm exceção configurada e não serão alterados.
              </div>
            </div>
            <div className="max-h-48 overflow-auto rounded-lg border border-border">
              <table className="min-w-[480px] text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Link</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profLinks.slice(0, 20).map((l) => {
                    const photoSkip = updatePhoto && l.photo_override;
                    const phoneSkip = updatePhone && l.whatsapp_override;
                    const skipped =
                      (updatePhoto && photoSkip && !updatePhone) ||
                      (updatePhone && phoneSkip && !updatePhoto) ||
                      (updatePhoto && photoSkip && updatePhone && phoneSkip);
                    return (
                      <tr key={l.id} className="border-t border-border">
                        <td className="max-w-80 break-all px-3 py-2 font-mono">{l.url}</td>
                        <td className="px-3 py-2">
                          {skipped ? (
                            <span className="inline-flex items-center gap-1 text-warning-foreground">
                              <AlertTriangle className="h-3 w-3" /> Exceção
                            </span>
                          ) : (
                            <span className="text-success">Será atualizado</span>
                          )}
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button disabled={!canAdvance} onClick={() => setStep(2)}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={confirm} disabled={submitting}>
                {submitting ? "Atualizando..." : "Confirmar atualização"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
