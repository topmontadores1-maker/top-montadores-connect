import { StackedTestimonialCards, type StackedTestimonial } from "@/components/ui/stacked-testimonial-cards";

const TESTIMONIALS: StackedTestimonial[] = [
  {
    name: "João Silva",
    content: "Quero agradecer ao montador de móveis, André Oliveira, por sua excelente habilidade em montagem de móveis. Ele montou meu rack com muita rapidez e eficiência, deixando-o perfeitamente nivelado. Foi um prazer trabalhar com ele e recomendo seus serviços a todos.",
  },
  {
    name: "Isabella Costa",
    content: "Estou muito satisfeito com o trabalho do montador de móveis, Juliano Silveira. Ele foi muito cuidadoso e eficiente na montagem do meu armário novo. Recomendo seus serviços para todos que precisam de ajuda com móveis.",
  },
  {
    name: "Gabriel Oliveira",
    content: "Gostaria de agradecer ao montador de móveis, Marcio Ribeiro, pela sua excelência em serviço. Ele foi pontual, profissional e montou meu sofá de forma rápida e eficiente. Definitivamente, contratarei seus serviços novamente no futuro.",
  },
  {
    name: "Rafaela Ferreira",
    content: "O montador de móveis, foi muito profissional e fez um ótimo trabalho na montagem do meu conjunto de mesa e cadeiras. Ele foi muito cuidadoso com todos os detalhes e o resultado final foi excepcional. Muito obrigado, Lucas!",
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="relative isolate overflow-hidden bg-[#0b2a59] py-16 text-white md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_5%_10%,rgba(100,161,255,0.23),transparent_30%),radial-gradient(circle_at_92%_88%,rgba(255,196,94,0.19),transparent_28%)]" />
      <div className="absolute left-[-8rem] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-white/10" aria-hidden="true" />
      <div className="absolute left-[-5rem] top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-white/10" aria-hidden="true" />

      <div className="container relative mx-auto grid items-center gap-10 px-4 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="max-w-xl text-center lg:text-left">
          <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#ffc34d]">Experiências reais</span>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Histórias de quem encontrou o profissional certo</h2>
          <p className="mt-5 text-base leading-relaxed text-white/65">
            Toque ou passe o cursor sobre os cartões para conhecer cada experiência com a Top Montadores.
          </p>
          <div className="mx-auto mt-7 flex w-fit items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 text-left backdrop-blur lg:mx-0">
            <span className="text-3xl font-black text-[#ffc34d]">5,0</span>
            <div>
              <div className="text-sm font-bold">Avaliação dos clientes</div>
              <div className="text-xs text-white/50">Quatro relatos verificados</div>
            </div>
          </div>
        </div>

        <StackedTestimonialCards testimonials={TESTIMONIALS} />
      </div>
    </section>
  );
}
