import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <a href="#servicos" className="hover:text-foreground">Serviços</a>
          <a href="#confianca" className="hover:text-foreground">Como funciona</a>
        </nav>
        <Button asChild variant="secondary" className="gap-2">
          <Link to="/montador">
            <UserPlus className="h-4 w-4" /> Sou montador
          </Link>
        </Button>
      </div>
    </header>
  );
}
