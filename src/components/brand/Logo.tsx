import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default" }: { className?: string; variant?: "default" | "light" }) {
  return (
    <Link to="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="Top Montadores - Início">
      <img
        src="/brand/logo-top.png"
        alt="Top Montadores"
        className={cn(
          "h-10 w-auto max-w-[190px] object-contain sm:h-12 sm:max-w-[230px]",
          variant === "light" && "brightness-110",
        )}
      />
    </Link>
  );
}
