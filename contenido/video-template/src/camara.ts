import { interpolate } from "remotion";

// ─────────────────────────────────────────────────────────────────────────
// CÁMARA VIRTUAL — da movimiento tipo "editor pro" sobre un clip fijo.
// En vez de un solo zoom igual en todos los videos, la línea de tiempo se
// parte en SEGMENTOS y a cada uno se le asigna un movimiento distinto
// (acercar, alejar, panear, tilt, deriva). El orden se elige con una semilla
// derivada del nombre del video → cada video se mueve distinto, pero siempre
// igual a sí mismo (determinista, sirve para render).
// ─────────────────────────────────────────────────────────────────────────

export type EstiloCamara = "auto" | "reposado" | "dinamico" | "agresivo";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// hash determinista (FNV-1a) → mismo nombre, misma secuencia de movimientos
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// easing suave (in-out cubic) para que ningún movimiento arranque/pare seco
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Move = { s0: number; s1: number; x0: number; x1: number; y0: number; y1: number };

// Biblioteca de movimientos. `i` = intensidad (según el estilo elegido).
// Todos mantienen scale ≥ ~1.05 para tener "overscan" y poder panear sin
// mostrar bordes negros del clip.
const MOVES: ((i: number) => Move)[] = [
  (i) => ({ s0: 1.05, s1: 1.05 + 0.1 * i, x0: 0, x1: 0, y0: 0, y1: 0 }), // ACERCAR (push in)
  (i) => ({ s0: 1.05 + 0.1 * i, s1: 1.05, x0: 0, x1: 0, y0: 0, y1: 0 }), // ALEJAR (pull out)
  (i) => ({ s0: 1.09, s1: 1.09, x0: -34 * i, x1: 34 * i, y0: 0, y1: 0 }), // PANEO izq → der
  (i) => ({ s0: 1.09, s1: 1.09, x0: 34 * i, x1: -34 * i, y0: 0, y1: 0 }), // PANEO der → izq
  (i) => ({ s0: 1.06, s1: 1.11, x0: 22 * i, x1: -12 * i, y0: 12 * i, y1: -8 * i }), // DERIVA diagonal + acercar
  (i) => ({ s0: 1.08, s1: 1.08, x0: 0, x1: 0, y0: 16 * i, y1: -16 * i }), // TILT vertical
];

type Cfg = { intens: number; segSec: number };
const ESTILOS: Record<Exclude<EstiloCamara, "auto">, Cfg> = {
  reposado: { intens: 0.5, segSec: 12 }, // pocos movimientos, suaves
  dinamico: { intens: 1.0, segSec: 7 },
  agresivo: { intens: 1.35, segSec: 5 }, // muchos cortes de cámara, marcados
};
const AUTO: Cfg = { intens: 0.85, segSec: 9 };

export function camara(opts: {
  seed: string;
  frame: number;
  total: number;
  fps: number;
  estilo?: EstiloCamara;
  punchFrames?: number[]; // frames donde dar un "golpe" de zoom (sincronizado con la voz)
}): { scale: number; x: number; y: number } {
  const { seed, frame, total, fps } = opts;
  const estilo = opts.estilo ?? "auto";
  const cfg = estilo === "auto" ? AUTO : ESTILOS[estilo];

  const segLen = Math.max(60, Math.round(cfg.segSec * fps));
  const nSeg = Math.max(1, Math.round(total / segLen));
  const realSeg = Math.ceil(total / nSeg);
  const idx = Math.min(nSeg - 1, Math.floor(frame / realSeg));
  const start = idx * realSeg;
  const len = Math.min(realSeg, total - start);
  const p = ease(interpolate(frame, [start, start + len], [0, 1], clamp));

  // elegir movimiento por semilla+segmento, evitando repetir el anterior
  let mv = hash(seed + ":" + idx) % MOVES.length;
  if (idx > 0) {
    const prev = hash(seed + ":" + (idx - 1)) % MOVES.length;
    if (mv === prev) mv = (mv + 1) % MOVES.length;
  }
  const m = MOVES[mv](cfg.intens);

  let scale = m.s0 + (m.s1 - m.s0) * p;
  let x = m.x0 + (m.x1 - m.x0) * p;
  let y = m.y0 + (m.y1 - m.y0) * p;

  // golpe de zoom sincronizado con la voz (cuando aparece un objeto/énfasis)
  if (opts.punchFrames) {
    for (const cf of opts.punchFrames) {
      if (frame >= cf - 2 && frame < cf + 12) {
        scale += interpolate(frame, [cf - 2, cf + 3, cf + 12], [0, 0.04 * cfg.intens, 0], clamp);
      }
    }
  }

  // limitar el paneo al overscan disponible → nunca mostrar borde negro
  const overX = ((scale - 1) / 2) * 1080;
  const overY = ((scale - 1) / 2) * 1920;
  x = Math.max(-overX, Math.min(overX, x));
  y = Math.max(-overY, Math.min(overY, y));

  return { scale, x, y };
}
