import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  phone,
  message,
  className,
  size = "lg",
  label = "Chamar no WhatsApp",
}: {
  phone: string;
  message?: string;
  className?: string;
  size?: "md" | "lg";
  label?: string;
}) {
  const href = `https://wa.me/${phone.replace(/\D/g, "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp font-bold text-whatsapp-foreground shadow-md transition-all hover:brightness-110 active:scale-[0.99]",
        size === "lg" ? "h-14 px-6 text-base" : "h-11 px-4 text-sm",
        className,
      )}
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </a>
  );
}
