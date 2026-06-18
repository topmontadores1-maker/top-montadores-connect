import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Users, Link2, Wrench, Upload, MapPin,
  BarChart3, Settings, ScrollText, Menu, X, ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/montadores", label: "Montadores", icon: Users },
  { to: "/admin/links", label: "Links e Cobertura", icon: Link2 },
  { to: "/admin/servicos", label: "Serviços", icon: Wrench },
  { to: "/admin/importacoes", label: "Importações", icon: Upload },
  { to: "/admin/cidades", label: "Cidades", icon: MapPin },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { to: "/admin/auditoria", label: "Auditoria", icon: ScrollText },
] as const;

export function AdminShell() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Logo variant="light" />
        </div>
        <Nav pathname={pathname} />
        <div className="border-t border-sidebar-border p-3">
          <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:bg-sidebar-accent">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Sidebar mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
              <Logo variant="light" />
              <button onClick={() => setOpen(false)} className="text-sidebar-foreground"><X className="h-5 w-5" /></button>
            </div>
            <Nav pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background px-4">
          <button onClick={() => setOpen(true)} className="md:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 text-sm font-semibold text-muted-foreground">
            Painel administrativo
          </div>
          <div className="hidden h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground sm:grid">A</div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Nav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {items.map((it) => {
        const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
