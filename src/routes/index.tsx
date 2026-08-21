import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";
import { Button } from "@/components/ui/button";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import {
  getPublicCities,
  getPublicServices,
  recordPublicSearchQuery,
} from "@/lib/supabase-queries";
import { BRAZIL_STATES, getCitiesByState, type BrazilCity } from "@/lib/brazil-localities";
import type { PublicService } from "@/integrations/supabase/database.types";
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  Tv,
  Hammer,
  DoorClosed,
  ChefHat,
  Blinds,
  LayoutGrid,
  Baby,
  Briefcase,
  Wind,
  Monitor,
  Store,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Tv,
  Hammer,
  DoorClosed,
  ChefHat,
  Blinds,
  LayoutGrid,
  Baby,
  Briefcase,
  Wind,
  Monitor,
  Store,
  Wrench,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Top Montadores — Encontre um montador perto de você" },
      {
        name: "description",
        content:
          "Encontre profissionais para montagem de móveis e serviços de instalação. Atendimento direto via WhatsApp.",
      },
      { property: "og:title", content: "Top Montadores" },
      { property: "og:description", content: "Encontre um montador perto de você." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [serviceSlug, setServiceSlug] = useState("");
  const [state, setState] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [services, setServices] = useState<PublicService[]>([]);
  const [cityOptions, setCityOptions] = useState<BrazilCity[]>([]);
  const [coveredCitiesCount, setCoveredCitiesCount] = useState(0);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    Promise.all([getPublicServices(), getPublicCities()])
      .then(([serviceRows, cityRows]) => {
        setServices(serviceRows);
        setCoveredCitiesCount(cityRows.length);
      })
      .catch((error) => {
        console.error("Error loading public directory:", error);
        toast.error("Erro ao carregar o diretório.");
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    setCitySlug("");
    setCityOptions([]);

    if (!state) return;

    setLoadingCities(true);
    getCitiesByState(state)
      .then((rows) => {
        if (!ignore) setCityOptions(rows);
      })
      .catch((error) => {
        console.error("Error loading cities:", error);
        if (!ignore) toast.error("Erro ao carregar cidades do estado.");
      })
      .finally(() => {
        if (!ignore) setLoadingCities(false);
      });

    return () => {
      ignore = true;
    };
  }, [state]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const matchedService = services.find((item) => item.slug === serviceSlug);
    const matchedCity = cityOptions.find((item) => item.slug === citySlug);

    if (!matchedService || !state || !matchedCity) {
      toast.error("Informe o serviço, estado e cidade.");
      return;
    }

    recordPublicSearchQuery({
      service_slug: matchedService.slug,
      service_name: matchedService.name,
      city: matchedCity.name,
      state: matchedCity.state,
      city_slug: matchedCity.slug,
    }).catch((error) => {
      console.error("Error recording public search query:", error);
    });

    navigate({
      to: "/s/$servico/$cidade",
      params: { servico: matchedService.slug, cidade: matchedCity.slug },
    });
  }

  function chooseService(selectedService: PublicService) {
    setServiceSlug(selectedService.slug);
    document
      .getElementById("public-search")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const serviceOptions = services.map((item) => ({
    value: item.slug,
    label: item.name,
    search: item.description ?? "",
  }));
  const stateOptions = BRAZIL_STATES.map((item) => ({
    value: item.uf,
    label: item.name,
    description: item.uf,
  }));
  const cityComboboxOptions = cityOptions.map((item) => ({
    value: item.slug,
    label: item.name,
    description: item.state,
    search: item.ibgeCode,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PixelHero
        eyebrow="Profissional montador"
        title="Montagem e desmontagem de móveis"
        accent="perto de você"
        description={
          <>
            Precisa de ajuda com a sua mobília? Encontre profissionais disponíveis na sua cidade e
            fale diretamente pelo WhatsApp.
          </>
        }
        imageSrc="/brand/profissional.png"
        imageAlt="Profissional montador com ferramentas"
      >
        <form
          id="public-search"
          onSubmit={search}
          className="grid w-full min-w-0 max-w-3xl gap-3 rounded-2xl border border-white/25 bg-white/95 p-3 text-foreground shadow-[0_24px_60px_rgba(1,16,40,0.32)] backdrop-blur md:grid-cols-2 md:p-4"
        >
          <SearchableCombobox
            value={serviceSlug}
            options={serviceOptions}
            onValueChange={setServiceSlug}
            placeholder="Serviço"
            searchPlaceholder="Pesquisar serviço"
            emptyText="Nenhum serviço encontrado."
            icon={Search}
          />
          <SearchableCombobox
            value={state}
            options={stateOptions}
            onValueChange={setState}
            placeholder="Estado"
            searchPlaceholder="Pesquisar estado"
            emptyText="Nenhum estado encontrado."
            icon={MapPin}
          />
          <SearchableCombobox
            value={citySlug}
            options={cityComboboxOptions}
            onValueChange={setCitySlug}
            placeholder={
              state ? (loadingCities ? "Carregando cidades..." : "Cidade") : "Selecione o estado"
            }
            searchPlaceholder="Pesquisar cidade"
            emptyText="Nenhuma cidade encontrada."
            disabled={!state || loadingCities}
            icon={MapPin}
          />
          <Button
            type="submit"
            size="lg"
            disabled={loadingCities}
            className="h-12 w-full min-w-0 px-4 text-base font-bold"
          >
            Buscar montador
          </Button>
          <div className="min-w-0 break-words text-left text-xs text-muted-foreground md:col-span-2">
            {state
              ? loadingCities
                ? "Carregando cidades..."
                : `${cityOptions.length} cidade(s) carregada(s) em ${state}`
              : `${coveredCitiesCount} cidade(s) com profissionais cadastrados`}
          </div>
        </form>
      </PixelHero>

      {/* SERVIÇOS */}
      <section id="servicos" className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">Tipos de serviço</h2>
            <p className="text-muted-foreground">
              Escolha um serviço para ver os profissionais disponíveis na sua cidade.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {services.map((s) => {
            const Icon = ICON_MAP[s.icon] ?? Wrench;
            return (
              <button
                type="button"
                key={s.slug}
                onClick={() => chooseService(s)}
                className="group flex min-w-0 flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="max-w-full break-words text-left text-sm font-bold">{s.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <TestimonialsSection />

      {/* CONFIANÇA */}
      <section id="confianca" className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-4">
            <Trust
              icon={ShieldCheck}
              title="Profissionais verificados"
              desc="Curadoria manual e validação de identidade."
            />
            <Trust
              icon={MapPin}
              title="Atendimento local"
              desc="Profissionais na sua região."
            />
            <Trust
              icon={Zap}
              title="Resposta rápida"
              desc="Conversa direta no WhatsApp."
            />
            <Trust
              icon={Users}
              title="Cobertura cadastrada"
              desc={`${coveredCitiesCount} cidade(s) com profissionais disponíveis.`}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Trust({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
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
