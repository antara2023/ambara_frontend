import { useEffect, useRef } from "react";

/**
 * Fixed canvas of twinkling stars that drift slowly. Cheap: one canvas, ~150 stars, paused when the tab is
 * hidden, static when the visitor prefers reduced motion.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type S = { x: number; y: number; r: number; p: number; s: number; warm: boolean };
    let stars: S[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(180, Math.round((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.25,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2,
        warm: Math.random() < 0.18,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const a = reduce ? 0.7 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(st.p + (t / 1000) * st.s));
        const y = reduce ? st.y : (st.y + t * 0.004 * st.r) % h;
        ctx.globalAlpha = a;
        ctx.fillStyle = st.warm ? "#f8d58e" : "#e8e6ff";
        ctx.beginPath();
        ctx.arc(st.x, y, st.r, 0, Math.PI * 2);
        ctx.fill();
        if (st.r > 1.2) {
          ctx.globalAlpha = a * 0.15;
          ctx.beginPath();
          ctx.arc(st.x, y, st.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="starfield pointer-events-none fixed inset-0 -z-10 opacity-80" />;
}
