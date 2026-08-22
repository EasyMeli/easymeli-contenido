import { interpolate } from "remotion";

// ─────────────────────────────────────────────────────────────────────────
// CÁMARA VIRTUAL — da movimiento tipo "editor pro" sobre un clip fijo.
// En vez de un solo zoom igual en todos los videos, la línea de tiempo se
// parte en SEGMENTOS y a cada uno se le asigna un movimiento distinto
// (acercar, alejar, panear, tilt, deriva, dutch). El orden se elige con una
// semilla derivada del nombre del video → cada video se mueve distinto, pero
// siempre igual a sí mismo (determinista, sirve para render).
//
// Encima del movimiento base se suman 3 recursos de editor pro, regulables:
//   · flotación handheld  → la imagen "respira" (deriva sutil continua)
//   · jump-cut zoom       → golpe seco de acercamiento en el énfasis/objeto
//   · micro-shake         → temblor corto de impacto en el énfasis/objeto
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

// ruido determinista en [-0.5, 0.5] a partir de una semilla numérica
const noise = (n: number) => ((hash(String(n)) % 100000) / 100000) - 0.5;

// easing suave (in-out cubic) para que ningún movimiento arranque/pare seco
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Move = { s0: number; s1: number; x0: number; x1: number; y0: number; y1: number; r0?: number; r1?: number };

// Biblioteca de movimientos. `i` = intensidad (según el estilo elegido).
// Todos mantienen scale ≥ ~1.05 para tener "overscan" y poder panear/rotar sin
// mostrar bordes negros del clip.
const MOVES: ((i: number) => Move)[] = [
  (i) => ({ s0: 1.05, s1: 1.05 + 0.1 * i, x0: 0, x1: 0, y0: 0, y1: 0 }), // ACERCAR (push in)
  (i) => ({ s0: 1.05 + 0.1 * i, s1: 1.05, x0: 0, x1: 0, y0: 0, y1: 0 }), // ALEJAR (pull out)
  (i) => ({ s0: 1.09, s1: 1.09, x0: -34 * i, x1: 34 * i, y0: 0, y1: 0 }), // PANEO izq → der
  (i) => ({ s0: 1.09, s1: 1.09, x0: 34 * i, x1: -34 * i, y0: 0, y1: 0 }), // PANEO der → izq
  (i) => ({ s0: 1.06, s1: 1.11, x0: 22 * i, x1: -12 * i, y0: 12 * i, y1: -8 * i }), // DERIVA diagonal + acercar
  (i) => ({ s0: 1.08, s1: 1.08, x0: 0, x1: 0, y0: 16 * i, y1: -16 * i }), // TILT vertical
  (i) => ({ s0: 1.1, s1: 1.13, x0: 0, x1: 0, y0: 0, y1: 0, r0: -2.4 * i, r1: 2.4 * i }), // DUTCH (rota leve + acerca)
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
  float?: number;   // 0-1 flotación handheld (la imagen "respira")
  shake?: number;   // 0-1 micro-temblor de impacto en cada punch
  jumpCut?: boolean; // golpe seco de acercamiento en cada punch (estilo TikTok)
}): { scale: number; x: number; y: number; rot: number } {
  const { seed, frame, total, fps } = opts;
  const estilo = opts.estilo ?? "auto";
  const cfg = estilo === "auto" ? AUTO : ESTILOS[estilo];
  const float = opts.float ?? 0;
  const shake = opts.shake ?? 0;

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
  let rot = (m.r0 ?? 0) + ((m.r1 ?? 0) - (m.r0 ?? 0)) * p;

  // FLOTACIÓN handheld: deriva sutil continua para que la imagen respire.
  if (float > 0) {
    x += Math.sin(frame / 37) * 7 * float;
    y += Math.cos(frame / 29) * 6 * float;
    rot += Math.sin(frame / 53) * 0.7 * float;
    scale += (Math.sin(frame / 61) * 0.006) * float;
  }

  // golpes sincronizados con la voz (cuando aparece un objeto/énfasis)
  if (opts.punchFrames) {
    for (const cf of opts.punchFrames) {
      // golpe de zoom suave (siempre): empuja y vuelve
      if (frame >= cf - 2 && frame < cf + 12) {
        scale += interpolate(frame, [cf - 2, cf + 3, cf + 12], [0, 0.04 * cfg.intens, 0], clamp);
      }
      // JUMP-CUT ZOOM: salto seco de acercamiento que decae (estilo TikTok)
      if (opts.jumpCut && frame >= cf && frame < cf + 9) {
        scale += interpolate(frame, [cf, cf + 1, cf + 9], [0.11, 0.11, 0], clamp) * cfg.intens;
      }
      // MICRO-SHAKE de impacto: temblor corto que se apaga
      if (shake > 0 && frame >= cf - 1 && frame < cf + 7) {
        const decay = Math.max(0, (7 - (frame - cf)) / 7);
        x += noise(hash(seed) + frame * 3 + 1) * 20 * shake * decay;
        y += noise(hash(seed) + frame * 3 + 2) * 20 * shake * decay;
        rot += noise(hash(seed) + frame * 3 + 3) * 2.2 * shake * decay;
      }
    }
  }

  // margen extra para que la rotación no muestre esquinas negras
  scale = Math.max(scale, 1 + Math.abs(rot) * 0.012);

  // limitar el paneo al overscan disponible → nunca mostrar borde negro
  const overX = ((scale - 1) / 2) * 1080;
  const overY = ((scale - 1) / 2) * 1920;
  x = Math.max(-overX, Math.min(overX, x));
  y = Math.max(-overY, Math.min(overY, y));

  return { scale, x, y, rot };
}
