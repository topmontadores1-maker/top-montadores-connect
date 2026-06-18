import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services } from "@/mocks/data";
import {
  Search, MapPin, ShieldCheck, Zap, Users, Star,
  Tv, Hammer, DoorClosed, ChefHat, Blinds, LayoutGrid,
  Baby, Briefcase, Wind, Monitor, Store, Wrench,
} from "lucide-react";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Tv, Hammer, DoorClosed, ChefHat, Blinds, LayoutGrid, Baby, Briefcase, Wind, Monitor, Store, Wrench,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Top Montadores — Encontre um montador perto de você" },
      { name: "description", content: "Diretório nacional de montadores de móveis e serviços de instalação. Atendimento direto via WhatsApp." },
      { property: "og:title", content: "Top Montadores" },
      { property: "og:description", content: "Encontre um montador perto de você." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [city, setCity] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !city) {
      toast.error("Informe o serviço e a cidade.");
      return;
    }
    const slugify = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    navigate({
      to: "/s/$servico/$cidade",
      params: { servico: slugify(service), cidade: slugify(city) },
    });
  }

  function useLocation() {
    toast("Localização", { description: "Detectando sua cidade aproximada…" });
    setTimeout(() => setCity("Balneário Camboriú SC"), 600);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_10%,white,transparent_40%),radial-gradient(circle_at_80%_90%,white,transparent_45%)]" />
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-white/20">
              <Star className="h-3.5 w-3.5" /> Diretório nacional
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              Encontre um montador perto de você
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80 md:text-lg">
              Atendimento direto via WhatsApp, sem cadastro e sem espera.
            </p>

            <form
              onSubmit={search}
              className="mx-auto mt-10 grid gap-3 rounded-2xl bg-card p-4 text-foreground shadow-2xl md:grid-cols-[1.2fr_1fr_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="Qual serviço você precisa?"
                  className="h-12 pl-9 text-base"
                  aria-label="Serviço"
                />
              </div>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade ou estado"
                  className="h-12 pl-9 text-base"
                  aria-label="Cidade ou estado"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 text-base font-bold">
                Buscar montador
              </Button>
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={useLocation}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <MapPin className="h-4 w-4" /> Usar minha localização
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">Tipos de serviço</h2>
            <p className="text-muted-foreground">Escolha um serviço para ver o profissional responsável na sua cidade.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {services.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? Wrench;
            return (
              <Link
                key={s.slug}
                to="/s/$servico/$cidade"
                params={{ servico: s.slug, cidade: "balneario-camboriu-sc" }}
                className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold">{s.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CONFIANÇA */}
      <section id="confianca" className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-4">
            <Trust icon={ShieldCheck} title="Profissionais verificados" desc="Curadoria manual e validação de identidade." />
            <Trust icon={MapPin} title="Atendimento local" desc="Um responsável por cidade — sem intermediários." />
            <Trust icon={Zap} title="Resposta rápida" desc="Conversa direta no WhatsApp do profissional." />
            <Trust icon={Users} title="Cobertura nacional" desc="312 cidades atendidas em todo o Brasil." />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-4">
            <Stat label="Montadores" value="184" />
            <Stat label="Cidades" value="312" />
            <Stat label="Atendimentos" value="42 mil" />
            <Stat label="Avaliação média" value="4,9★" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Trust({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-black text-primary md:text-3xl">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
