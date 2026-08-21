import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalPage({ title, description, updatedAt, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Termos e privacidade
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Última atualização: {updatedAt}</p>
        </div>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <section key={section.title} className="rounded-xl border border-border bg-card p-5 md:p-6">
              <h2 className="text-lg font-black">
                {index + 1}. {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground md:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
