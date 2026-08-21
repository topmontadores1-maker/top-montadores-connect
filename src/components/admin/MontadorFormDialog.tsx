import { useEffect, useState, type ReactElement } from "react";
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
import { MapPin, Plus, Search, Trash2 } from "lucide-react";
import {
  createProfessional,
  getPublicServices,
  getServices,
  submitPublicProfessionalRegistration,
  replaceProfessionalPortfolio,
  syncProfessionalPublicLinks,
  updateProfessional,
  updateProfessionalServices,
} from "@/lib/supabase-queries";
import { buscaCep } from "@/lib/busca-cep";
import type {
  Professional,
  ProfessionalPortfolioItem,
  PublicService,
} from "@/integrations/supabase/database.types";
import { auditActions } from "@/lib/audit";
import { removeProfessionalImages, uploadProfessionalImage } from "@/lib/image-storage";
import { toast } from "sonner";

export type ProfessionalFormData = Pick<
  Professional,
  | "id"
  | "name"
  | "whatsapp"
  | "email"
  | "doc"
  | "photo_url"
  | "city"
  | "state"
  | "postal_code"
  | "street"
  | "address_number"
  | "address_complement"
  | "neighborhood"
  | "hours"
  | "notes"
  | "neighborhoods"
  | "status"
> & { services: string[]; portfolio?: ProfessionalPortfolioItem[] };

type PortfolioDraft = {
  id: string;
  imageUrl: string;
  imageFile: File | null;
  description: string;
};

type FormState = {
  name: string;
  whatsapp: string;
  email: string;
  doc: string;
  photoUrl: string;
  postalCode: string;
  street: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  city: string;
  state: string;
  hours: string;
  notes: string;
  serviceNeighborhoods: string;
  status: Professional["status"];
  services: string[];
};

type CepLockedFields = {
  street: boolean;
  addressNeighborhood: boolean;
  city: boolean;
  state: boolean;
};

const EMPTY_CEP_LOCKS: CepLockedFields = {
  street: false,
  addressNeighborhood: false,
  city: false,
  state: false,
};

const EMPTY_FORM: FormState = {
  name: "",
  whatsapp: "",
  email: "",
  doc: "",
  photoUrl: "",
  postalCode: "",
  street: "",
  addressNumber: "",
  addressComplement: "",
  addressNeighborhood: "",
  city: "",
  state: "",
  hours: "Seg a Sex, 9h às 18h",
  notes: "",
  serviceNeighborhoods: "",
  status: "pendente",
  services: [],
};

export function MontadorFormDialog({
  professional,
  trigger,
  onSaved,
  mode = "admin",
}: {
  professional?: ProfessionalFormData;
  trigger?: ReactElement;
  onSaved?: (professional: Professional, services: string[]) => void;
  mode?: "admin" | "public";
}) {
  const isPublicRegistration = mode === "public";
  const isEditing = Boolean(professional) && !isPublicRegistration;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [services, setServices] = useState<PublicService[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioDraft[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [cepLockedFields, setCepLockedFields] = useState<CepLockedFields>(EMPTY_CEP_LOCKS);

  useEffect(() => {
    if (!open) return;
    setForm(professional ? formFromProfessional(professional) : EMPTY_FORM);
    setPhotoFile(null);
    setPortfolio(
      [...(professional?.portfolio || [])]
        .sort((a, b) => a.position - b.position)
        .map((item) => ({
          id: item.id,
          imageUrl: item.image_url,
          imageFile: null,
          description: item.description || "",
        })),
    );
    setRemovedImageUrls([]);
    setCepLockedFields(EMPTY_CEP_LOCKS);
    if (services.length === 0) {
      const loadServices = isPublicRegistration ? getPublicServices : getServices;
      loadServices()
        .then(setServices)
        .catch((error) => {
          console.error("Error loading services:", error);
          toast.error("Erro ao carregar serviços.");
        });
    }
  }, [open, professional, services.length, isPublicRegistration]);

  async function handleBuscaCep() {
    setSearchingCep(true);
    try {
      const address = await buscaCep(form.postalCode);
      setForm((current) => ({
        ...current,
        postalCode: address.cep,
        street: address.street || current.street,
        addressNeighborhood: address.neighborhood || current.addressNeighborhood,
        city: address.city || current.city,
        state: address.state || current.state,
        addressComplement: current.addressComplement || address.complement,
      }));
      setCepLockedFields({
        street: Boolean(address.street),
        addressNeighborhood: Boolean(address.neighborhood),
        city: Boolean(address.city),
        state: Boolean(address.state),
      });
      toast.success("Endereço encontrado. Complete número e complemento.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao buscar CEP.");
    } finally {
      setSearchingCep(false);
    }
  }

  async function submit() {
    if (!form.name.trim()) return toast.error("Nome é obrigatório.");
    if (!/^\d{12,13}$/.test(form.whatsapp))
      return toast.error("WhatsApp inválido (use 55DDD9XXXXXXXX).");
    if (form.services.length === 0) return toast.error("Selecione ao menos um serviço.");
    if (form.state && form.state.length !== 2) return toast.error("UF deve ter 2 letras.");
    if (portfolio.some((item) => !item.imageUrl && !item.imageFile)) {
      return toast.error("Selecione uma imagem para cada serviço executado.");
    }
    if (portfolio.some((item) => item.description.length > 500)) {
      return toast.error("Cada descrição deve ter no máximo 500 caracteres.");
    }

    const addressComplete =
      /^\d{8}$/.test(form.postalCode) &&
      Boolean(
        form.street.trim() &&
        form.addressNumber.trim() &&
        form.addressNeighborhood.trim() &&
        form.city.trim() &&
        form.state.length === 2,
      );
    if ((isPublicRegistration || form.status === "ativo") && !addressComplete) {
      return toast.error("Complete CEP, logradouro, número, bairro, cidade e UF.");
    }

    setLoading(true);
    const newlyUploadedUrls: string[] = [];
    try {
      const uploadFolder = isPublicRegistration
        ? `registrations/${crypto.randomUUID()}`
        : `professionals/${professional?.id || `new-${crypto.randomUUID()}`}`;
      const uploadedPhoto = photoFile
        ? await uploadProfessionalImage(photoFile, `${uploadFolder}/profile`, "profile")
        : null;
      if (uploadedPhoto) newlyUploadedUrls.push(uploadedPhoto.url);

      const portfolioPayload = await Promise.all(
        portfolio.map(async (item, index) => {
          const uploaded = item.imageFile
            ? await uploadProfessionalImage(
                item.imageFile,
                `${uploadFolder}/portfolio`,
                "portfolio",
              )
            : null;
          if (uploaded) newlyUploadedUrls.push(uploaded.url);

          return {
            image_url: uploaded?.url || item.imageUrl,
            description: item.description.trim() || null,
            position: index + 1,
          };
        }),
      );

      const payload = {
        name: form.name.trim(),
        whatsapp: form.whatsapp,
        email: form.email.trim() || null,
        doc: form.doc.trim() || null,
        photo_url: uploadedPhoto?.url || form.photoUrl || null,
        postal_code: form.postalCode || null,
        street: form.street.trim() || null,
        address_number: form.addressNumber.trim() || null,
        address_complement: form.addressComplement.trim() || null,
        neighborhood: form.addressNeighborhood.trim() || null,
        city: form.city.trim(),
        state: form.state.toUpperCase(),
        hours: form.hours.trim() || null,
        notes: form.notes.trim() || null,
        status: isPublicRegistration ? ("pendente" as const) : form.status,
        neighborhoods: form.serviceNeighborhoods
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (isPublicRegistration) {
        await submitPublicProfessionalRegistration(payload, form.services, portfolioPayload);
        setOpen(false);
        setForm(EMPTY_FORM);
        setPhotoFile(null);
        setPortfolio([]);
        setRemovedImageUrls([]);
        toast.success(
          "Cadastro enviado para análise. Nossa equipe entrará em contato após a verificação.",
        );
        return;
      }

      const saved = professional
        ? await updateProfessional(professional.id, payload)
        : await createProfessional(payload, form.services, portfolioPayload);
      if (professional) {
        await updateProfessionalServices(professional.id, form.services);
        await replaceProfessionalPortfolio(professional.id, portfolioPayload);
      }

      const linkResult = await syncProfessionalPublicLinks(saved, form.services);
      if (professional) await auditActions.updateProfessional(saved.name, "cadastro e endereço");
      else await auditActions.createProfessional(saved.name);

      onSaved?.(saved, form.services);
      await removeProfessionalImages(removedImageUrls).catch((error) => {
        console.error("Error removing replaced professional images:", error);
      });
      setOpen(false);
      setForm(EMPTY_FORM);
      setPhotoFile(null);
      setPortfolio([]);
      setRemovedImageUrls([]);
      const action = professional ? "atualizado" : "cadastrado";
      toast.success(
        linkResult.publishable
          ? `Montador ${action}. ${linkResult.generated} link(s) público(s) ativo(s).`
          : `Montador ${action}. Links públicos permanecem inativos até o cadastro ficar completo e ativo.`,
      );
    } catch (error) {
      console.error("Error saving professional:", error);
      if (!isPublicRegistration && newlyUploadedUrls.length > 0) {
        await removeProfessionalImages(newlyUploadedUrls).catch(() => undefined);
      }
      toast.error(
        isPublicRegistration
          ? "Não foi possível enviar o cadastro. Verifique os dados e tente novamente."
          : professional
            ? "Erro ao atualizar montador."
            : "Erro ao cadastrar montador.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Novo montador
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>
            {isPublicRegistration
              ? "Quero me cadastrar"
              : isEditing
                ? `Editar ${professional?.name}`
                : "Cadastrar novo montador"}
          </DialogTitle>
          <DialogDescription>
            {isPublicRegistration
              ? "Preencha seus dados para análise. O cadastro será criado como pendente e não poderá ser acessado sem login."
              : "O CEP preenche o endereço disponível. Número, prédio, bloco e apartamento devem ser informados manualmente."}
          </DialogDescription>
        </DialogHeader>

        <Section title="Dados do profissional">
          <Field
            label="Nome completo *"
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
          />
          <Field
            label="WhatsApp *"
            value={form.whatsapp}
            onChange={(value) => setForm({ ...form, whatsapp: value.replace(/\D/g, "") })}
            placeholder="5547999991111"
          />
          <Field
            label="E-mail"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
          />
          <Field
            label="Documento"
            value={form.doc}
            onChange={(value) => setForm({ ...form, doc: value })}
          />
          <ImageUploadField
            label="Foto do profissional"
            value={form.photoUrl}
            file={photoFile}
            onFileChange={(file) => {
              if (form.photoUrl) setRemovedImageUrls((current) => [...current, form.photoUrl]);
              setPhotoFile(file);
            }}
            onRemove={() => {
              if (form.photoUrl) setRemovedImageUrls((current) => [...current, form.photoUrl]);
              setForm((current) => ({ ...current, photoUrl: "" }));
              setPhotoFile(null);
            }}
            disabled={loading}
            className="md:col-span-2"
          />
          <Field
            label="Horário"
            value={form.hours}
            onChange={(value) => setForm({ ...form, hours: value })}
          />
          {isPublicRegistration ? (
            <div>
              <Label>Status</Label>
              <Input
                value="Pendente de análise"
                readOnly
                className="cursor-not-allowed bg-muted/60"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Somente a equipe administrativa pode ativar cadastros.
              </p>
            </div>
          ) : (
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
          )}
        </Section>

        <div className="space-y-3 rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 font-bold">
            <MapPin className="h-4 w-4" /> Endereço
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field
              label="CEP *"
              value={form.postalCode}
              onChange={(value) => {
                setForm({ ...form, postalCode: value.replace(/\D/g, "").slice(0, 8) });
                setCepLockedFields(EMPTY_CEP_LOCKS);
              }}
              placeholder="01001000"
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleBuscaCep}
                disabled={searchingCep || form.postalCode.length !== 8}
                className="gap-2"
              >
                <Search className="h-4 w-4" /> {searchingCep ? "Buscando..." : "Buscar CEP"}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Logradouro *"
              value={form.street}
              onChange={(value) => setForm({ ...form, street: value })}
              readOnly={cepLockedFields.street}
            />
            <Field
              label="Número *"
              value={form.addressNumber}
              onChange={(value) => setForm({ ...form, addressNumber: value })}
            />
            <Field
              label="Bairro *"
              value={form.addressNeighborhood}
              onChange={(value) => setForm({ ...form, addressNeighborhood: value })}
              readOnly={cepLockedFields.addressNeighborhood}
            />
            <Field
              label="Complemento (prédio, bloco, apartamento)"
              value={form.addressComplement}
              onChange={(value) => setForm({ ...form, addressComplement: value })}
            />
            <Field
              label="Cidade *"
              value={form.city}
              onChange={(value) => setForm({ ...form, city: value })}
              readOnly={cepLockedFields.city}
            />
            <Field
              label="UF *"
              value={form.state}
              onChange={(value) => setForm({ ...form, state: value.toUpperCase().slice(0, 2) })}
              readOnly={cepLockedFields.state}
            />
          </div>
        </div>

        <div>
          <Label>Serviços atendidos *</Label>
          <div className="mt-2 grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-border p-3 sm:grid-cols-2 md:grid-cols-3">
            {services.map((service) => {
              const checked = form.services.includes(service.slug);
              return (
                <label key={service.slug} className="flex min-w-0 items-center gap-2 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      setForm({
                        ...form,
                        services: value
                          ? Array.from(new Set([...form.services, service.slug]))
                          : form.services.filter((slug) => slug !== service.slug),
                      })
                    }
                  />
                  <span className="min-w-0 break-words">{service.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label>Serviços já executados</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={loading || portfolio.length >= 4}
              onClick={() =>
                setPortfolio((current) => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    imageUrl: "",
                    imageFile: null,
                    description: "",
                  },
                ])
              }
            >
              <Plus className="h-4 w-4" /> Adicionar foto
            </Button>
          </div>

          {portfolio.map((item, index) => (
            <div
              key={item.id}
              className="grid min-w-0 gap-4 rounded-md border border-border p-4 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)_auto]"
            >
              <ImageUploadField
                label={`Foto ${index + 1}`}
                value={item.imageUrl}
                file={item.imageFile}
                onFileChange={(file) => {
                  if (item.imageUrl) setRemovedImageUrls((current) => [...current, item.imageUrl]);
                  setPortfolio((current) =>
                    current.map((currentItem) =>
                      currentItem.id === item.id
                        ? { ...currentItem, imageFile: file }
                        : currentItem,
                    ),
                  );
                }}
                onRemove={() => {
                  if (item.imageUrl) setRemovedImageUrls((current) => [...current, item.imageUrl]);
                  setPortfolio((current) =>
                    current.map((currentItem) =>
                      currentItem.id === item.id
                        ? { ...currentItem, imageUrl: "", imageFile: null }
                        : currentItem,
                    ),
                  );
                }}
                disabled={loading}
              />
              <div>
                <Label htmlFor={`portfolio-description-${item.id}`}>Breve descrição</Label>
                <Textarea
                  id={`portfolio-description-${item.id}`}
                  rows={4}
                  maxLength={500}
                  value={item.description}
                  onChange={(event) =>
                    setPortfolio((current) =>
                      current.map((currentItem) =>
                        currentItem.id === item.id
                          ? { ...currentItem, description: event.target.value }
                          : currentItem,
                      ),
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Remover serviço executado"
                disabled={loading}
                onClick={() => {
                  if (item.imageUrl) setRemovedImageUrls((current) => [...current, item.imageUrl]);
                  setPortfolio((current) =>
                    current.filter((currentItem) => currentItem.id !== item.id),
                  );
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remover serviço executado</span>
              </Button>
            </div>
          ))}
        </div>

        <Field
          label="Bairros atendidos (separados por vírgula)"
          value={form.serviceNeighborhoods}
          onChange={(value) => setForm({ ...form, serviceNeighborhoods: value })}
        />
        <div>
          <Label>Observações</Label>
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading
              ? "Salvando..."
              : isPublicRegistration
                ? "Enviar cadastro"
                : isEditing
                  ? "Salvar alterações"
                  : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formFromProfessional(professional: ProfessionalFormData): FormState {
  return {
    name: professional.name,
    whatsapp: professional.whatsapp,
    email: professional.email || "",
    doc: professional.doc || "",
    photoUrl: professional.photo_url || "",
    postalCode: professional.postal_code || "",
    street: professional.street || "",
    addressNumber: professional.address_number || "",
    addressComplement: professional.address_complement || "",
    addressNeighborhood: professional.neighborhood || "",
    city: professional.city,
    state: professional.state,
    hours: professional.hours || "",
    notes: professional.notes || "",
    serviceNeighborhoods: professional.neighborhoods.join(", "),
    status: professional.status,
    services: professional.services,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="font-bold">{title}</div>
      <div className="grid min-w-0 gap-4 md:grid-cols-2 [&>*]:min-w-0">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? "cursor-not-allowed bg-muted/60" : undefined}
      />
    </div>
  );
}
