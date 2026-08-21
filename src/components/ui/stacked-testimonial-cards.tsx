import { useEffect, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Quote, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StackedTestimonial = {
  name: string;
  content: string;
  rating?: number;
};

export function StackedTestimonialCards({
  testimonials,
  className,
}: {
  testimonials: StackedTestimonial[];
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = testimonials[selectedIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [testimonials.length]);

  function selectRelative(direction: -1 | 1) {
    setSelectedIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  if (!active) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="mx-auto w-full max-w-2xl">
        <article className="flex min-h-[340px] flex-col rounded-3xl border border-[#ffc34d]/55 bg-white p-5 text-left text-[#14213d] shadow-[0_28px_70px_rgba(2,17,43,0.32)] ring-2 ring-[#ffc34d]/25 transition-opacity duration-500 sm:min-h-[330px] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#234c8d] via-[#4776b9] to-[#d7a85e] text-sm font-black text-white ring-2 ring-[#234c8d]/10 sm:h-12 sm:w-12">
              {initials(active.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-black">{active.name}</span>
                <BadgeCheck
                  className="h-4 w-4 shrink-0 fill-[#1d9bf0] text-white"
                  aria-label="Avaliação verificada"
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">Cliente Top Montadores</span>
            </div>
            <Quote className="h-7 w-7 shrink-0 text-[#244a86]/18" aria-hidden="true" />
          </div>

          <blockquote className="mt-5 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
            "{active.content}"
          </blockquote>

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-200 pt-5">
            <div>
              <div className="flex gap-0.5" aria-label={`${active.rating ?? 5} de 5 estrelas`}>
                {Array.from({ length: active.rating ?? 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="h-4 w-4 fill-[#f7b928] text-[#f7b928]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Serviço recomendado
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#244a86]/8 px-2.5 py-1 text-[11px] font-bold text-[#244a86]">
              <ShieldCheck className="h-3.5 w-3.5" /> Verificado
            </span>
          </div>
        </article>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button type="button" size="icon" variant="outline" onClick={() => selectRelative(-1)} aria-label="Depoimento anterior" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#0b2a59]">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2" aria-label={`Depoimento ${selectedIndex + 1} de ${testimonials.length}`}>
          {testimonials.map((testimonial, index) => (
            <button
              type="button"
              key={testimonial.name}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Exibir depoimento de ${testimonial.name}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                selectedIndex === index ? "w-7 bg-[#ffc34d]" : "w-2 bg-white/30 hover:bg-white/55",
              )}
            />
          ))}
        </div>
        <Button type="button" size="icon" variant="outline" onClick={() => selectRelative(1)} aria-label="Próximo depoimento" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#0b2a59]">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
