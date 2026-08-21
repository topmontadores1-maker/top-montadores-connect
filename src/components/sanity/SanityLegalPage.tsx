import type { PortableTextBlock } from "@portabletext/react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PortableTextContent } from "@/components/sanity/PortableTextContent";

type Cta = {
  label?: string;
  href?: string;
};

type HeroSection = {
  _key?: string;
  _type: "heroSection";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

type RichTextSection = {
  _key?: string;
  _type: "richTextSection";
  title?: string;
  body?: PortableTextBlock[];
};

type CtaSection = {
  _key?: string;
  _type: "ctaSection";
  title?: string;
  body?: string;
  cta?: Cta;
};

type FaqItem = {
  _id: string;
  question?: string;
  answer?: PortableTextBlock[];
};

type FaqSection = {
  _key?: string;
  _type: "faqSection";
  title?: string;
  items?: FaqItem[];
};

export type SanityLegalSection =
  | HeroSection
  | RichTextSection
  | CtaSection
  | FaqSection;

export type SanityLegalPageData = {
  _id: string;
  _updatedAt?: string;
  title?: string;
  slug?: string;
  seo?: {
    metaDescription?: string;
  };
  sections?: SanityLegalSection[];
};

type SanityLegalPageProps = {
  page: SanityLegalPageData;
  fallbackDescription: string;
  fallbackUpdatedAt: string;
};

function formatUpdatedAt(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function CtaLink({ cta }: { cta?: Cta }) {
  if (!cta?.label || !cta.href) {
    return null;
  }

  return (
    <a
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      href={cta.href}
    >
      {cta.label}
    </a>
  );
}

function SectionContent({ section, index }: { section: SanityLegalSection; index: number }) {
  if (section._type === "heroSection") {
    return (
      <section className="rounded-xl border border-border bg-card p-5 md:p-6">
        {section.eyebrow ? (
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            {section.eyebrow}
          </p>
        ) : null}
        {section.title ? <h2 className="text-lg font-black">{section.title}</h2> : null}
        {section.subtitle ? (
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            {section.subtitle}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <CtaLink cta={section.primaryCta} />
          <CtaLink cta={section.secondaryCta} />
        </div>
      </section>
    );
  }

  if (section._type === "richTextSection") {
    return (
      <section className="rounded-xl border border-border bg-card p-5 md:p-6">
        {section.title ? (
          <h2 className="text-lg font-black">
            {index + 1}. {section.title}
          </h2>
        ) : null}
        {section.body?.length ? (
          <div className="mt-3 text-sm leading-7 md:text-base">
            <PortableTextContent value={section.body} />
          </div>
        ) : null}
      </section>
    );
  }

  if (section._type === "faqSection") {
    return (
      <section className="rounded-xl border border-border bg-card p-5 md:p-6">
        <h2 className="text-lg font-black">{section.title || "Perguntas frequentes"}</h2>
        <div className="mt-4 space-y-4">
          {section.items?.map((item) => (
            <article key={item._id}>
              {item.question ? <h3 className="font-semibold">{item.question}</h3> : null}
              {item.answer?.length ? (
                <div className="text-sm leading-7 md:text-base">
                  <PortableTextContent value={item.answer} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6">
      {section.title ? <h2 className="text-lg font-black">{section.title}</h2> : null}
      {section.body ? (
        <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
          {section.body}
        </p>
      ) : null}
      <div className="mt-4">
        <CtaLink cta={section.cta} />
      </div>
    </section>
  );
}

export function SanityLegalPage({
  page,
  fallbackDescription,
  fallbackUpdatedAt,
}: SanityLegalPageProps) {
  const description = page.seo?.metaDescription || fallbackDescription;
  const updatedAt = formatUpdatedAt(page._updatedAt, fallbackUpdatedAt);
  const sections = page.sections || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Termos e privacidade
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
            {page.title || "Termos de Uso"}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Última atualização: {updatedAt}</p>
        </div>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <SectionContent key={section._key || `${section._type}-${index}`} index={index} section={section} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
