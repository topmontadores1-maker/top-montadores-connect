import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#082653]/95 text-white shadow-[0_8px_30px_rgba(3,18,43,0.18)] backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4">
        <Logo variant="light" />
        <nav className="hidden items-center gap-7 text-sm font-bold text-white/70 md:flex">
          <Link to="/" className="transition-colors hover:text-white">Início</Link>
          <a href="#servicos" className="transition-colors hover:text-white">Serviços</a>
          <a href="#depoimentos" className="transition-colors hover:text-white">Depoimentos</a>
          <a href="#confianca" className="transition-colors hover:text-white">Como funciona</a>
        </nav>
        <Button asChild className="gap-2 border border-white/20 bg-white text-[#14356f] shadow-lg hover:bg-white/90">
          <Link to="/montador">
            <UserPlus className="h-4 w-4" /> Sou montador
          </Link>
        </Button>
      </div>
    </header>
  );
}
