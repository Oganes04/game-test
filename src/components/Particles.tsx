import { useEffect, useRef } from 'react';
import type { Scene } from '../data/types';

const CONFIG: Record<Scene, { color: string; count: number; speed: number; up: boolean; size: number }> = {
  factory: { color: '108,140,255', count: 26, speed: 10, up: false, size: 1.4 },
  alarm: { color: '168,107,255', count: 30, speed: 14, up: false, size: 1.5 },
  grim: { color: '255,93,115', count: 34, speed: 8, up: true, size: 1.8 },
  personal: { color: '230,220,210', count: 30, speed: 6, up: true, size: 2.2 },
  void: { color: '200,107,255', count: 14, speed: 4, up: true, size: 1.3 },
  final: { color: '255,255,255', count: 22, speed: 12, up: true, size: 1.2 },
};

interface P {
  x: number;
  y: number;
  v: number;
  r: number;
  a: number;
  phase: number;
}

/** Лёгкие фоновые частицы на canvas: пыль цеха, дым, искры Пустоты. */
export function Particles({ scene }: { scene: Scene }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const cfg = CONFIG[scene];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ps: P[] = Array.from({ length: cfg.count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      v: cfg.speed * (0.4 + Math.random()),
      r: cfg.size * (0.5 + Math.random()),
      a: 0.15 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.phase += dt;
        p.y += (cfg.up ? -p.v : p.v * 0.3) * dt;
        p.x += (cfg.up ? Math.sin(p.phase) * 6 : -p.v) * dt;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        const flick = scene === 'void' || scene === 'final' ? 0.5 + 0.5 * Math.sin(p.phase * 3) : 1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${cfg.color},${p.a * flick})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [scene]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
