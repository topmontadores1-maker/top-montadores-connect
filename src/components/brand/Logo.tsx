import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default" }: { className?: string; variant?: "default" | "light" }) {
  const isLight = variant === "light";
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-extrabold", className)}>
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-lg",
          isLight ? "bg-white text-primary" : "bg-primary text-primary-foreground",
        )}
      >
        <Wrench className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("text-base", isLight ? "text-white" : "text-foreground")}>Top Montadores</span>
        <span className={cn("text-[10px] font-semibold uppercase tracking-widest", isLight ? "text-white/70" : "text-muted-foreground")}>
          Diretório nacional
        </span>
      </span>
    </Link>
  );
}
