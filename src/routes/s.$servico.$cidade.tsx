import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, Clock, Images, MapPin, Share2, BadgeCheck } from "lucide-react";
import {
  getPublicCities,
  getPublicLinksForServiceCity,
  getPublicServices,
  incrementLinkClicks,
  type PublicDirectoryLink,
} from "@/lib/supabase-queries";
import type { PublicCity, PublicService } from "@/integrations/supabase/database.types";
import { toast } from "sonner";

export const Route = createFileRoute("/s/$servico/$cidade")({
  head: ({ params }) => {
    const cityLabel = prettify(params.cidade);
    const svcLabel = prettify(params.servico);
    const title = `${svcLabel} em ${cityLabel} — Top Montadores`;
    const desc = `Profissionais disponíveis para ${svcLabel.toLowerCase()} em ${cityLabel}. Atendimento direto via WhatsApp.`;
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
  const [services, setServices] = useState<PublicService[]>([]);
  const [cities, setCities] = useState<PublicCity[]>([]);
  const [publicLinks, setPublicLinks] = useState<PublicDirectoryLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPublicServices(),
      getPublicCities(),
      getPublicLinksForServiceCity(servico, cidade),
    ])
      .then(([serviceRows, cityRows, links]) => {
        setServices(serviceRows);
        setCities(cityRows);
        setPublicLinks(links);
      })
      .catch((error) => {
        console.error("Error loading public directory page:", error);
        toast.error("Erro ao carregar profissionais.");
      })
      .finally(() => setLoading(false));
  }, [servico, cidade]);

  const svc = services.find((service) => service.slug === servico);
  const city = cities.find((item) => item.slug === cidade);
  const availableLinks = publicLinks;
  const neighborhoods = Array.from(new Set(availableLinks.flatMap((link) => link.neighborhoods)));

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

  function trackWhatsAppClick(linkId: string) {
    incrementLinkClicks(linkId).catch((error) => {
      console.error("Error tracking WhatsApp click:", error);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Serviços</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>{svcLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{cityLabel}</span>
        </nav>

        <h1 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
          {svcLabel} em {cityLabel}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Escolha um profissional disponível para {svcLabel.toLowerCase()} em {cityLabel}.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <main className="space-y-5">
            {loading ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                Carregando profissionais...
              </div>
            ) : availableLinks.length > 0 ? (
              availableLinks.map((publicLink) => {
                const pro = publicLink;
                return (
                  <article
                    key={publicLink.link_id}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <div className="flex flex-col gap-6 p-6 sm:flex-row">
                      <img
                        src={pro.photo_url || "/placeholder.svg"}
                        alt={pro.name}
                        loading="lazy"
                        decoding="async"
                        className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-4 ring-accent"
                      />
                      <div className="min-w-0 flex-1">
                        <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/15">
                          <BadgeCheck className="h-3.5 w-3.5" /> Profissional disponível
                        </Badge>
                        <h2 className="mt-2 text-2xl font-black">{pro.name}</h2>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {pro.professional_city}, {pro.professional_state}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {pro.hours || "Consulte a disponibilidade"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {pro.service_slugs.map((service_slug) => {
                            const serviceName = services.find(
                              (item) => item.slug === service_slug,
                            )?.name;
                            return (
                              <span
                                key={service_slug}
                                className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                              >
                                {serviceName ?? service_slug}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 border-t border-border bg-muted/30 p-6 sm:grid-cols-[1fr_auto_auto]">
                      <WhatsAppButton
                        phone={pro.whatsapp}
                        message={`Olá ${pro.name.split(" ")[0]}! Vim do Top Montadores e preciso de ${svcLabel.toLowerCase()} em ${cityLabel}.`}
                        onClick={() => trackWhatsAppClick(publicLink.link_id)}
                      />
                      {(pro.portfolio || []).length > 0 && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="lg" className="h-14 gap-2">
                              <Images className="h-4 w-4" /> Ver trabalhos
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
                            <DialogHeader>
                              <DialogTitle>Serviços executados por {pro.name}</DialogTitle>
                              <DialogDescription>
                                Fotos enviadas pelo profissional durante o cadastro.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {[...(pro.portfolio || [])]
                                .sort((a, b) => a.position - b.position)
                                .map((item) => (
                                  <figure
                                    key={item.id}
                                    className="overflow-hidden rounded-md border border-border bg-card"
                                  >
                                    <img
                                      src={item.image_url}
                                      alt={item.description || `Serviço executado por ${pro.name}`}
                                      loading="lazy"
                                      decoding="async"
                                      className="aspect-[4/3] w-full object-cover"
                                    />
                                    {item.description && (
                                      <figcaption className="p-3 text-sm text-muted-foreground">
                                        {item.description}
                                      </figcaption>
                                    )}
                                  </figure>
                                ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button variant="outline" size="lg" onClick={share} className="h-14 gap-2">
                        <Share2 className="h-4 w-4" /> Compartilhar link
                      </Button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <h3 className="text-lg font-bold">Em breve nesta cidade</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ainda não temos profissionais disponíveis para {svcLabel.toLowerCase()} em{" "}
                  {cityLabel}.
                </p>
                <Button asChild className="mt-6">
                  <Link to="/montador">Quero atender esta região</Link>
                </Button>
              </div>
            )}

            <section className="space-y-4 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
              <h3 className="text-base font-bold text-foreground">
                Sobre {svcLabel.toLowerCase()} em {cityLabel}
              </h3>
              <p>
                Consulte um dos profissionais disponíveis para confirmar escopo, prazo e condições
                do atendimento.
              </p>
              <p>
                {neighborhoods.length
                  ? `Bairros atendidos: ${neighborhoods.join(", ")}.`
                  : "Consulte pelo WhatsApp quais bairros são atendidos."}
              </p>

              <div>
                <h4 className="mb-2 font-bold text-foreground">Perguntas frequentes</h4>
                <Accordion type="single" collapsible>
                  <AccordionItem value="q1">
                    <AccordionTrigger>
                      Quanto custa {svcLabel.toLowerCase()} em {cityLabel}?
                    </AccordionTrigger>
                    <AccordionContent>
                      O valor varia conforme o porte do serviço; solicite o orçamento pelo WhatsApp.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2">
                    <AccordionTrigger>Vocês atendem no fim de semana?</AccordionTrigger>
                    <AccordionContent>
                      Consulte a disponibilidade informada por cada profissional ou confirme
                      diretamente pelo WhatsApp.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3">
                    <AccordionTrigger>O profissional leva ferramentas?</AccordionTrigger>
                    <AccordionContent>
                      Confirme diretamente com o profissional quais materiais e ferramentas estão
                      incluídos.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          </main>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Outros serviços em {city?.city ?? cityLabel}
              </h3>
              <ul className="mt-3 divide-y divide-border">
                {services
                  .slice(0, 6)
                  .filter((service) => service.slug !== servico)
                  .map((service) => (
                    <li key={service.slug}>
                      <Link
                        to="/s/$servico/$cidade"
                        params={{ servico: service.slug, cidade }}
                        className="flex items-center justify-between py-3 text-sm font-semibold hover:text-primary"
                      >
                        {service.name}
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
                {cities
                  .filter((item) => item.slug !== cidade)
                  .slice(0, 6)
                  .map((item) => (
                    <li key={item.slug}>
                      <Link
                        to="/s/$servico/$cidade"
                        params={{ servico, cidade: item.slug }}
                        className="block rounded-md bg-accent px-2.5 py-2 text-xs font-semibold text-accent-foreground hover:bg-primary hover:text-primary-foreground"
                      >
                        {item.city}, {item.state}
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
  return slug.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
