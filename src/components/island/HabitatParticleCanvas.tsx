import React, { useEffect, useRef } from 'react';
import { HabitatId } from '../../types/island';

interface HabitatParticleCanvasProps {
  biome: HabitatId;
  className?: string;
}

type ParticleKind =
  | 'petal'
  | 'butterfly'
  | 'pollen'
  | 'leaf'
  | 'firefly'
  | 'ripple'
  | 'bubble'
  | 'sparkle'
  | 'bambooLeaf'
  | 'mist'
  | 'snowflake'
  | 'glint'
  | 'orb'
  | 'spore';

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
  phase: number;
  spin: number;
}

interface BiomeSpec {
  kinds: Array<{ kind: ParticleKind; count: number }>;
}

const BIOME_SPECS: Record<HabitatId, BiomeSpec> = {
  meadow: {
    kinds: [
      { kind: 'petal', count: 14 },
      { kind: 'butterfly', count: 3 },
      { kind: 'pollen', count: 16 },
    ],
  },
  forest_treehouse: {
    kinds: [
      { kind: 'leaf', count: 12 },
      { kind: 'firefly', count: 9 },
    ],
  },
  crystal_pond: {
    kinds: [
      { kind: 'ripple', count: 5 },
      { kind: 'bubble', count: 12 },
      { kind: 'sparkle', count: 10 },
    ],
  },
  bamboo_grove: {
    kinds: [
      { kind: 'bambooLeaf', count: 14 },
      { kind: 'mist', count: 12 },
    ],
  },
  snowy_peak: {
    kinds: [
      { kind: 'snowflake', count: 28 },
      { kind: 'glint', count: 7 },
    ],
  },
  fairy_hollow: {
    kinds: [
      { kind: 'orb', count: 12 },
      { kind: 'spore', count: 10 },
    ],
  },
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function spawnParticle(kind: ParticleKind, width: number, height: number): Particle {
  const base: Particle = {
    kind,
    x: rand(0, width),
    y: rand(0, height),
    vx: 0,
    vy: 0,
    size: 6,
    life: 1,
    maxLife: 1,
    hue: 0,
    phase: rand(0, Math.PI * 2),
    spin: rand(-0.4, 0.4),
  };

  switch (kind) {
    case 'petal':
      return { ...base, vx: rand(-12, 12), vy: rand(10, 24), size: rand(5, 9), hue: rand(330, 360) };
    case 'butterfly':
      return { ...base, vx: rand(-18, 18), vy: rand(-8, 8), size: rand(7, 11), hue: rand(20, 320) };
    case 'pollen':
      return { ...base, vx: rand(-8, 8), vy: rand(-6, 6), size: rand(1.5, 3), hue: 50 };
    case 'leaf':
      return { ...base, vx: rand(-16, 8), vy: rand(14, 28), size: rand(6, 11), hue: rand(15, 40) };
    case 'firefly':
      return { ...base, vx: rand(-10, 10), vy: rand(-10, 10), size: rand(2, 4), hue: 70 };
    case 'ripple':
      return { ...base, y: rand(height * 0.45, height * 0.85), size: rand(8, 16), maxLife: rand(2.4, 4), life: 0 };
    case 'bubble':
      return { ...base, vx: rand(-6, 6), vy: rand(-22, -10), size: rand(3, 7), y: height + rand(0, 20) };
    case 'sparkle':
      return { ...base, size: rand(1.5, 3), hue: 190, maxLife: rand(1.2, 2.2), life: rand(0, 1) };
    case 'bambooLeaf':
      return { ...base, vx: rand(-20, -4), vy: rand(8, 18), size: rand(7, 13), hue: 95 };
    case 'mist':
      return { ...base, vx: rand(-6, 6), vy: rand(-4, 4), size: rand(18, 36), y: rand(height * 0.5, height) };
    case 'snowflake':
      return { ...base, vx: rand(-14, 14), vy: rand(16, 32), size: rand(2, 5) };
    case 'glint':
      return { ...base, size: rand(2, 4), hue: 200, maxLife: rand(1, 2), life: rand(0, 1) };
    case 'orb':
      return { ...base, vx: rand(-8, 8), vy: rand(-8, 8), size: rand(3, 6), hue: rand(260, 320) };
    case 'spore':
      return { ...base, vx: rand(-5, 5), vy: rand(-10, -2), size: rand(3, 6), hue: 290, maxLife: rand(2, 3.5), life: rand(0, 1) };
  }
}

function wrap(p: Particle, width: number, height: number): void {
  if (p.kind === 'ripple' || p.kind === 'sparkle' || p.kind === 'glint') return;
  if (p.x < -20) p.x = width + 20;
  if (p.x > width + 20) p.x = -20;
  if (p.y < -20) p.y = height + 20;
  if (p.y > height + 20) p.y = -20;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  const alpha = p.kind === 'ripple' || p.kind === 'sparkle' || p.kind === 'glint' || p.kind === 'spore'
    ? Math.max(0, 1 - p.life / p.maxLife)
    : 0.85;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin);

  switch (p.kind) {
    case 'petal': {
      ctx.fillStyle = `hsla(${p.hue}, 70%, 72%, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'butterfly': {
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(p.phase));
      ctx.fillStyle = `hsla(${p.hue}, 72%, 62%, 0.88)`;
      ctx.beginPath();
      ctx.ellipse(-p.size * flap, 0, p.size * flap, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.ellipse(p.size * flap, 0, p.size * flap, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(-1, -p.size * 0.45, 2, p.size * 0.9);
      break;
    }
    case 'pollen': {
      ctx.fillStyle = `hsla(48, 90%, 70%, ${0.45 * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'leaf': {
      ctx.fillStyle = `hsla(${p.hue}, 75%, 48%, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.4, 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'firefly': {
      const glow = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.phase));
      ctx.fillStyle = `hsla(70, 90%, 62%, ${glow})`;
      ctx.shadowColor = 'hsla(70, 100%, 70%, 0.9)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ripple': {
      const radius = p.size + p.life * 18;
      ctx.strokeStyle = `hsla(195, 70%, 60%, ${0.45 * alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'bubble': {
      ctx.strokeStyle = `hsla(195, 80%, 70%, ${0.55 * alpha})`;
      ctx.fillStyle = `hsla(195, 80%, 85%, ${0.18 * alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'sparkle': {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(p.phase));
      ctx.fillStyle = `hsla(190, 90%, 80%, ${pulse * alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.35, 0);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'bambooLeaf': {
      ctx.fillStyle = `hsla(${p.hue}, 55%, 38%, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.28, 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mist': {
      ctx.fillStyle = `hsla(90, 20%, 90%, ${0.12 * alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'snowflake': {
      ctx.strokeStyle = `hsla(210, 40%, 96%, ${alpha})`;
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.lineTo(p.size, 0);
        ctx.stroke();
      }
      break;
    }
    case 'glint': {
      const shine = 0.3 + 0.7 * Math.abs(Math.sin(p.phase * 2));
      ctx.fillStyle = `hsla(195, 90%, 85%, ${shine * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'orb': {
      const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(p.phase));
      ctx.fillStyle = `hsla(${p.hue}, 85%, 72%, ${twinkle})`;
      ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, 0.8)`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'spore': {
      const pulse = 0.55 + 0.45 * Math.sin(p.phase);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${0.4 * pulse * alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * pulse, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

function seedParticles(biome: HabitatId, width: number, height: number): Particle[] {
  const spec = BIOME_SPECS[biome];
  const particles: Particle[] = [];
  for (const entry of spec.kinds) {
    for (let i = 0; i < entry.count; i++) {
      particles.push(spawnParticle(entry.kind, width, height));
    }
  }
  return particles;
}

export const HabitatParticleCanvas: React.FC<HabitatParticleCanvasProps> = ({ biome, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const biomeRef = useRef(biome);

  useEffect(() => {
    biomeRef.current = biome;
  }, [biome]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let frame = 0;
    let last = performance.now();
    let width = 0;
    let height = 0;

    const syncSize = () => {
      const parent = canvas.parentElement;
      const nextWidth = parent?.clientWidth || canvas.clientWidth || 1;
      const nextHeight = parent?.clientHeight || canvas.clientHeight || 1;
      if (nextWidth === width && nextHeight === height && particles.length > 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.max(1, Math.floor(nextWidth * dpr));
      canvas.height = Math.max(1, Math.floor(nextHeight * dpr));
      canvas.style.width = `${nextWidth}px`;
      canvas.style.height = `${nextHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = seedParticles(biomeRef.current, width, height);
    };

    syncSize();

    const onResize = () => syncSize();
    window.addEventListener('resize', onResize);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    if (canvas.parentElement && resizeObserver) {
      resizeObserver.observe(canvas.parentElement);
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) {
        last = now;
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.phase += dt * (p.kind === 'butterfly' ? 10 : 2.2);
        p.spin += dt * (p.kind === 'snowflake' ? 1.6 : 0.4);
        p.x += p.vx * dt + (p.kind === 'snowflake' || p.kind === 'petal' ? Math.sin(p.phase) * 8 * dt : 0);
        p.y += p.vy * dt;

        if (p.kind === 'ripple' || p.kind === 'sparkle' || p.kind === 'glint' || p.kind === 'spore') {
          p.life += dt;
          if (p.life >= p.maxLife) {
            Object.assign(p, spawnParticle(p.kind, width, height));
          }
        } else {
          wrap(p, width, height);
        }

        drawParticle(ctx, p);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      resizeObserver?.disconnect();
    };
  }, [biome]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
};
