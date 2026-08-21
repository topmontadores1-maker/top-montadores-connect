import { useEffect, useId, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { validateImage } from "@/lib/image-storage";
import { toast } from "sonner";

export function ImageUploadField({
  label,
  value,
  file,
  onFileChange,
  onRemove,
  disabled = false,
  className,
}: {
  label: string;
  value?: string | null;
  file?: File | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(value || null);

  useEffect(() => {
    if (!file) {
      setPreview(value || null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, value]);

  function selectFile(selected?: File) {
    if (!selected) return;
    try {
      validateImage(selected);
      onFileChange(selected);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Imagem inválida.");
    }
  }

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          selectFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {preview ? (
        <div className="flex min-h-28 min-w-0 flex-wrap items-center gap-3 rounded-md border border-border p-3">
          <img
            src={preview}
            alt="Pré-visualização"
            className="h-24 w-24 shrink-0 rounded-md object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" asChild disabled={disabled}>
              <label htmlFor={inputId} className="cursor-pointer gap-2">
                <Upload className="h-4 w-4" /> Trocar
              </label>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={disabled}
              title="Remover imagem"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remover imagem</span>
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-28 w-full border-dashed"
          asChild
          disabled={disabled}
        >
          <label htmlFor={inputId} className="cursor-pointer flex-col gap-2">
            <ImagePlus className="h-6 w-6" /> Selecionar imagem
          </label>
        </Button>
      )}
    </div>
  );
}
