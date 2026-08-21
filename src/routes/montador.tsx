import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { MontadorFormDialog } from "@/components/admin/MontadorFormDialog";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/montador")({
  head: () => ({
    meta: [
      { title: "Sou montador — Top Montadores" },
      {
        name: "description",
        content: "Cadastre-se como montador e receba clientes da sua região direto no WhatsApp.",
      },
    ],
  }),
  component: MontadorLanding,
});

function MontadorLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Para profissionais
          </span>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Receba serviços na sua cidade, direto no WhatsApp
          </h1>
          <p className="mt-4 text-muted-foreground">
            Mostre seus serviços para clientes da sua região. Sem leilão e sem comissão por contato.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Visibilidade na sua cidade",
              "Sem cobrança por contato",
              "Suporte e curadoria da plataforma",
              "Links públicos otimizados para SEO",
            ].map((i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" /> {i}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <MontadorFormDialog
              mode="public"
              trigger={<Button size="lg">Quero me cadastrar</Button>}
            />
            <Button asChild size="lg" variant="outline">
              <Link to="/">Voltar</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-10 text-primary-foreground">
          <h3 className="text-2xl font-black">Como funciona</h3>
          <ol className="mt-4 space-y-3 text-sm">
            <li>1. Você se cadastra e envia seus dados.</li>
            <li>2. Nossa equipe verifica e ativa sua cobertura.</li>
            <li>3. Clientes encontram seu perfil pelo Google e chamam no WhatsApp.</li>
          </ol>
        </div>
      </section>
      <Footer />
    </div>
  );
}
