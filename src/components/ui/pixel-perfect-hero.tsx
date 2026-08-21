import { useCallback, useEffect, useRef, type ReactNode } from "react";

type Pixel = {
  x: number;
  y: number;
  color: string;
  phase: number;
  speed: number;
};

const HERO_PIXEL_COLORS = ["#ffffff", "#8bbcff", "#ffc75f", "#dce9ff"];

function PixelCanvas({ colors, gap = 26 }: { colors: string[]; gap?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef(0);

  const initialize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);

    const pixels: Pixel[] = [];
    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        if (Math.random() > 0.66) {
          pixels.push({
            x,
            y,
            color: colors[Math.floor(Math.random() * colors.length)],
            phase: Math.random() * Math.PI * 2,
            speed: 0.00035 + Math.random() * 0.00055,
          });
        }
      }
    }
    pixelsRef.current = pixels;
  }, [colors, gap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (time = 0) => {
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (const pixel of pixelsRef.current) {
        const alpha = reducedMotion ? 0.2 : 0.08 + ((Math.sin(time * pixel.speed + pixel.phase) + 1) / 2) * 0.3;
        context.globalAlpha = alpha;
        context.fillStyle = pixel.color;
        context.fillRect(pixel.x, pixel.y, 2.5, 2.5);
      }
      context.globalAlpha = 1;
      if (!reducedMotion) animationRef.current = requestAnimationFrame(draw);
    };

    initialize();
    draw();
    const observer = new ResizeObserver(() => {
      initialize();
      if (reducedMotion) draw();
    });
    if (wrapRef.current) observer.observe(wrapRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [initialize]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

type PixelHeroProps = {
  eyebrow: string;
  title: string;
  accent: string;
  description: ReactNode;
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
};

export function PixelHero({ eyebrow, title, accent, description, imageSrc, imageAlt, children }: PixelHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a2b5b] text-white">
      <style>{`
        @keyframes hero-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: 0% center; }
        }
        @keyframes hero-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .hero-shimmer {
          color: transparent;
          background: linear-gradient(110deg, #ffffff 10%, #ffe2a8 35%, #ffffff 52%, #9ec6ff 72%, #ffffff 90%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: hero-shimmer 8s linear infinite;
        }
        .hero-professional { animation: hero-float 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-shimmer, .hero-professional { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 bg-[linear-gradient(105deg,#0a2b5b_0%,#163f73_52%,#d4aa70_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(255,255,255,0.2),transparent_31%),linear-gradient(to_bottom,transparent_70%,rgba(3,18,43,0.35))]" />
      <PixelCanvas colors={HERO_PIXEL_COLORS} />

      <div className="pointer-events-none absolute bottom-0 left-0 hidden h-[72%] w-[42%] opacity-10 lg:block" aria-hidden="true">
        <div className="absolute bottom-0 left-[4%] h-40 w-52 border border-white/40 bg-white/15" />
        <div className="absolute bottom-36 left-[13%] h-36 w-40 border border-white/40 bg-white/10" />
        <div className="absolute bottom-0 left-[31%] h-28 w-56 border border-white/40 bg-white/10" />
      </div>

      <div className="container relative mx-auto grid min-h-[720px] items-center gap-8 px-4 pb-0 pt-14 lg:min-h-[650px] lg:grid-cols-[1.08fr_0.92fr] lg:py-12">
        <div className="relative z-10 max-w-3xl pb-8 lg:pb-0">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            {eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="block">{title}</span>
            <span className="hero-shimmer block">{accent}</span>
          </h1>
          <div className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</div>
          <div className="mt-8">{children}</div>
        </div>

        <div className="relative flex min-h-[370px] items-end justify-center self-end lg:min-h-[590px]">
          <div className="absolute bottom-[8%] h-[72%] w-[72%] rounded-[36%] border-[12px] border-[#082b5d] bg-white/92 shadow-[0_30px_80px_rgba(2,17,41,0.38)]" />
          <div className="absolute bottom-[19%] right-[4%] h-24 w-44 rounded-2xl border border-white/40 bg-white/15 backdrop-blur-sm" />
          <img
            src={imageSrc}
            alt={imageAlt}
            className="hero-professional relative z-10 max-h-[520px] w-auto max-w-full object-contain drop-shadow-[0_28px_34px_rgba(0,18,50,0.38)] lg:max-h-[610px]"
          />
        </div>
      </div>
    </section>
  );
}
