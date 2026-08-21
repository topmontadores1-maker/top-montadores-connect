import { supabase } from "@/integrations/supabase/client";

export const PROFESSIONAL_IMAGES_BUCKET = "professional-images";
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_SOURCE_IMAGE_SIZE = 20 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type ProfessionalImageKind = "profile" | "portfolio";

const IMAGE_SETTINGS: Record<ProfessionalImageKind, { maxDimension: number; quality: number }> = {
  profile: { maxDimension: 960, quality: 0.82 },
  portfolio: { maxDimension: 1600, quality: 0.82 },
};

export type UploadedImage = {
  path: string;
  url: string;
};

export function validateImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato inválido. Use JPG, PNG, WebP ou AVIF.");
  }
  if (file.size > MAX_SOURCE_IMAGE_SIZE) {
    throw new Error("A imagem original deve ter no máximo 20 MB.");
  }
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;

  try {
    await image.decode();
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      dispose: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== "image/webp") {
          reject(new Error("Seu navegador não conseguiu converter a imagem para WebP."));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

export async function convertImageToWebp(file: File, kind: ProfessionalImageKind) {
  validateImage(file);

  const decoded = await decodeImage(file);
  try {
    const { maxDimension, quality } = IMAGE_SETTINGS[kind];
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível processar a imagem.");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, width, height);

    const blob = await canvasToWebp(canvas, quality);
    if (blob.size > MAX_IMAGE_SIZE) {
      throw new Error("A imagem convertida ainda excede 5 MB. Escolha uma imagem menor.");
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "imagem";
    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    decoded.dispose();
  }
}

export async function uploadProfessionalImage(
  file: File,
  folder: string,
  kind: ProfessionalImageKind,
): Promise<UploadedImage> {
  const webpFile = await convertImageToWebp(file, kind);
  const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
  const path = `${cleanFolder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(PROFESSIONAL_IMAGES_BUCKET).upload(path, webpFile, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(PROFESSIONAL_IMAGES_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export function getProfessionalImagePath(url: string) {
  const marker = `/storage/v1/object/public/${PROFESSIONAL_IMAGES_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  const encodedPath = url.slice(markerIndex + marker.length).split("?")[0];
  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

export async function removeProfessionalImages(urls: string[]) {
  const paths = Array.from(new Set(urls.map(getProfessionalImagePath).filter(Boolean))) as string[];
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(PROFESSIONAL_IMAGES_BUCKET).remove(paths);
  if (error) throw error;
}
