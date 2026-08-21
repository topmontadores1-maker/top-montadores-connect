import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

type FooterLink = {
  label: string;
  to?: string;
  href?: string;
};

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#071d3f] text-white">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo variant="light" />
          <p className="text-sm text-white/60">
            Encontre profissionais para montagem de móveis e serviços de instalação,
            com atendimento direto pelo WhatsApp.
          </p>
        </div>
        <FooterCol
          title="Para clientes"
          links={[
            { label: "Como funciona", href: "/#confianca" },
            { label: "Serviços", href: "/#servicos" },
            { label: "Depoimentos", href: "/#depoimentos" },
          ]}
        />
        <FooterCol
          title="Para montadores"
          links={[
            { label: "Cadastre-se", to: "/montador" },
          ]}
        />
        <FooterCol
          title="Institucional"
          links={[
            { label: "Termos de uso", to: "/termos-de-uso" },
            { label: "Política de privacidade", to: "/politica-de-privacidade" },
            { label: "Política de cookies", to: "/politicas-de-cookies" },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 md:flex-row">
          <span>© {new Date().getFullYear()} Top Montadores. Todos os direitos reservados.</span>
          <span>Atendimento de norte a sul do Brasil</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-bold">{title}</h4>
      <ul className="space-y-2 text-sm text-white/55">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link to={link.to as never} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ) : (
              <a href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
