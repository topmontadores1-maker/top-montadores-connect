import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Diretório nacional de montadores de móveis e serviços de instalação,
            com atendimento direto via WhatsApp.
          </p>
        </div>
        <FooterCol title="Para clientes" links={["Como funciona", "Serviços", "Cobertura", "Suporte"]} />
        <FooterCol title="Para montadores" links={["Cadastre-se", "Como aparecer", "Boas práticas", "Central do montador"]} />
        <FooterCol title="Institucional" links={["Sobre", "Termos de uso", "Política de privacidade", "Contato"]} />
      </div>
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Top Montadores. Todos os direitos reservados.</span>
          <span>Atendimento de norte a sul do Brasil</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}
