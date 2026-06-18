import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronRight, Clock, MapPin, Share2, BadgeCheck,
} from "lucide-react";
import {
  services, cities, getProfessionalForServiceCity, findServiceBySlug, findCityBySlug,
} from "@/mocks/data";
import { toast } from "sonner";

export const Route = createFileRoute("/s/$servico/$cidade")({
  head: ({ params }) => {
    const svc = findServiceBySlug(params.servico);
    const city = findCityBySlug(params.cidade);
    const cityLabel = city ? `${city.city}, ${city.state}` : params.cidade;
    const svcLabel = svc?.name ?? params.servico;
    const title = `${svcLabel} em ${cityLabel} — Top Montadores`;
    const desc = `Profissional responsável por ${svcLabel.toLowerCase()} em ${cityLabel}. Atendimento direto via WhatsApp.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: ServiceCity,
});

function ServiceCity() {
  const { servico, cidade } = useParams({ from: "/s/$servico/$cidade" });
  const svc = findServiceBySlug(servico);
  const city = findCityBySlug(cidade);
  const pro = getProfessionalForServiceCity(servico, cidade);

  const svcLabel = svc?.name ?? prettify(servico);
  const cityLabel = city ? `${city.city}, ${city.state}` : prettify(cidade);

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: `${svcLabel} em ${cityLabel}`, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Serviços</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{svcLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">{cityLabel}</span>
        </nav>

        <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
          {svcLabel} em {cityLabel}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Fale agora com o profissional responsável por {svcLabel.toLowerCase()} em {cityLabel}.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Card do profissional */}
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {pro ? (
              <>
                <div className="flex flex-col gap-6 p-6 sm:flex-row">
                  <img
                    src={pro.photoUrl}
                    alt={pro.name}
                    className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-4 ring-accent"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/15">
                        <BadgeCheck className="h-3.5 w-3.5" /> Profissional responsável
                      </Badge>
                    </div>
                    <h2 className="mt-2 text-2xl font-black">{pro.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{pro.city}, {pro.state}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{pro.hours}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {pro.services.map((s) => {
                        const sv = findServiceBySlug(s);
                        return (
                          <span key={s} className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                            {sv?.name ?? s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-border bg-muted/30 p-6 sm:grid-cols-[1fr_auto]">
                  <WhatsAppButton
                    phone={pro.whatsapp}
                    message={`Olá ${pro.name.split(" ")[0]}! Vim do Top Montadores e preciso de ${svcLabel.toLowerCase()} em ${cityLabel}.`}
                  />
                  <Button variant="outline" size="lg" onClick={share} className="h-14 gap-2">
                    <Share2 className="h-4 w-4" /> Compartilhar link
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-10 text-center">
                <h3 className="text-lg font-bold">Em breve nesta cidade</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ainda não temos um profissional responsável por {svcLabel.toLowerCase()} em {cityLabel}.
                </p>
                <Button asChild className="mt-6">
                  <Link to="/montador">Quero atender esta região</Link>
                </Button>
              </div>
            )}

            {/* Conteúdo local SEO */}
            <section className="space-y-4 border-t border-border p-6 text-sm leading-relaxed text-muted-foreground">
              <h3 className="text-base font-bold text-foreground">
                Sobre {svcLabel.toLowerCase()} em {cityLabel}
              </h3>
              <p>
                O serviço de {svcLabel.toLowerCase()} em {cityLabel} exige cuidado com paredes,
                acabamentos e itens próprios da região. Nosso profissional responsável atende com
                ferramentas próprias e garantia do serviço prestado.
              </p>
              <p>
                Atendimento em bairros como {(pro?.neighborhoods ?? ["Centro", "Bairros próximos"]).join(", ")},
                com horário flexível e orçamento sem compromisso pelo WhatsApp.
              </p>

              <div>
                <h4 className="mb-2 font-bold text-foreground">Perguntas frequentes</h4>
                <Accordion type="single" collapsible>
                  <AccordionItem value="q1">
                    <AccordionTrigger>Quanto custa {svcLabel.toLowerCase()} em {cityLabel}?</AccordionTrigger>
                    <AccordionContent>O valor varia conforme o porte do serviço; o orçamento é gratuito pelo WhatsApp.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>Vocês atendem no fim de semana?</AccordionTrigger>
                    <AccordionContent>Sim, conforme a agenda do profissional responsável: {pro?.hours ?? "consulte direto pelo WhatsApp"}.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3">
                    <AccordionTrigger>O profissional leva ferramentas?</AccordionTrigger>
                    <AccordionContent>Sim, o profissional já vai com todas as ferramentas necessárias para o serviço.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </article>

          {/* Serviços relacionados */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Outros serviços em {city?.city ?? cityLabel}
              </h3>
              <ul className="mt-3 divide-y divide-border">
                {services.slice(0, 6).filter((s) => s.slug !== servico).map((s) => (
                  <li key={s.slug}>
                    <Link
                      to="/s/$servico/$cidade"
                      params={{ servico: s.slug, cidade }}
                      className="flex items-center justify-between py-3 text-sm font-semibold hover:text-primary"
                    >
                      {s.name}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {svcLabel} em outras cidades
              </h3>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {cities.filter((c) => c.slug !== cidade).slice(0, 6).map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/s/$servico/$cidade"
                      params={{ servico, cidade: c.slug }}
                      className="block rounded-md bg-accent px-2.5 py-2 text-xs font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground"
                    >
                      {c.city}, {c.state}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function prettify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
