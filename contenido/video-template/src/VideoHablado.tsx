import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, delayRender, continueRender, cancelRender } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import type { Caption } from "@remotion/captions";
import { z } from "zod";
import { BRAND, FONTS } from "./brand";
import { Intro } from "./Intro";
import { Subtitulos } from "./Subtitulos";
import { ICONOS, type IconoNombre } from "./iconos";
import { Lottie } from "@remotion/lottie";
import { camara, type EstiloCamara } from "./camara";
import { MARGIN } from "./ui";

// Fase 6 — VIDEO HABLADO: el usuario a cámara, editado nivel pro.
// Capas: efectos de cámara (zoom + punch) sobre su footage + subtítulos
// automáticos (whisper) + título gancho + placas de dato + marca + CTA.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const BrandHeader: React.FC = () => (
  <div style={{ position: "absolute", left: MARGIN, top: 90, display: "flex", alignItems: "center", gap: 16 }}>
    <img src={staticFile("logo.png")} style={{ width: 84, height: 84 }} />
    <div style={{ lineHeight: 1 }}>
      <div style={{ color: BRAND.paper, fontFamily: FONTS.display, fontSize: 40, textShadow: "0 3px 12px rgba(0,0,0,0.7)" }}>EASY</div>
      <div style={{ color: BRAND.yellow, fontFamily: FONTS.display, fontSize: 40, textShadow: "0 3px 12px rgba(0,0,0,0.7)" }}>MELI</div>
    </div>
  </div>
);

const TituloGancho: React.FC<{ lineas: { t: string; hot?: boolean }[]; salida?: number }> = ({ lineas, salida = 150 }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [salida, salida + 18], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 240 }}>
      {lineas.map((l, i) => (
        <div
          key={i}
          style={{
            opacity: interpolate(frame, [4 + i * 3, 16 + i * 3], [0, 1], clamp) * out,
            transform: `translateY(${interpolate(frame, [4 + i * 3, 16 + i * 3], [30, 0], clamp)}px)`,
            color: l.hot ? BRAND.yellow : BRAND.paper,
            fontFamily: FONTS.display,
            fontSize: 74,
            lineHeight: 1.05,
            textShadow: "0 4px 20px rgba(0,0,0,0.75)",
          }}
        >
          {l.t}
        </div>
      ))}
    </div>
  );
};

const PlacaChip: React.FC<{ text: string; delay: number; x: number; y: number; dur?: number }> = ({ text, delay, x, y, dur = 95 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 120 } });
  const bob = Math.sin((frame - delay) / 16) * 10;
  const vis = interpolate(frame, [delay, delay + 6, delay + dur - 12, delay + dur], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: pop * vis,
        transform: `translateY(${bob}px) scale(${interpolate(pop, [0, 1], [0.5, 1])}) rotate(-4deg)`,
        background: BRAND.yellow,
        color: BRAND.ink,
        fontFamily: FONTS.display,
        fontSize: 92,
        padding: "12px 30px",
        borderRadius: 18,
        boxShadow: "0 14px 30px rgba(0,0,0,0.5)",
      }}
    >
      {text}
    </div>
  );
};

// ── Callouts sincronizados con la voz ──────────────────────────────────
// Aparecen placas de marca justo cuando decís cada concepto clave (usando los
// tiempos de los subtítulos). Da movimiento y refuerzo durante TODO el video.
// Cada regla: si dice esa palabra, aparece un OBJETO (ícono de marca) o una
// placa de TEXTO. Cubre conceptos del nicho MercadoLibre → cada video muestra
// los objetos que correspondan a lo que se habla (varía por video).
// Prioridad de cada regla: lottie (animado) > objeto (foto PNG) > icono (vector) > texto.
// `objeto` = archivo en public/objetos/ ; `lottie` = archivo en public/lottie/.
type Regla = { re: RegExp; text?: string; icono?: IconoNombre; objeto?: string; lottie?: string; label?: string; grande?: boolean };
const REGLAS: Regla[] = [
  { re: /\b10\s*%/, text: "-10%", grande: true },
  { re: /\b20\s*%/, text: "-20%", grande: true },
  { re: /marg[ei]n/i, text: "TU MARGEN" },
  { re: /promoci/i, objeto: "etiqueta.png", icono: "etiqueta", label: "PROMO" },
  { re: /cup[oó]n|cop[oó]n/i, objeto: "cupon.png", icono: "cupon", label: "CUPÓN" },
  { re: /bolsillo|plata|dinero/i, objeto: "billete.png", icono: "billete", label: "TU PLATA" },
  { re: /env[ií]o|flete|full|despacho/i, objeto: "camion.png", icono: "camion", label: "ENVÍO" },
  { re: /algoritmo|posicion|catálogo|catalogo|anunci/i, objeto: "grafico.png", icono: "grafico" },
  { re: /reputaci|vendedor|reclamo/i, objeto: "estrella.png", icono: "estrella" },
  { re: /marca|inapi|denunci|patente/i, objeto: "escudo.png", icono: "escudo" },
  { re: /cuidado|error|problema|pierdes|perder/i, objeto: "alerta.png", icono: "alerta" },
  { re: /producto|publicaci|stock/i, objeto: "caja.png", icono: "caja" },
  { re: /venta|compra|carrito/i, objeto: "carrito.png", icono: "carrito" },
  { re: /perfil|comunidad|link|bio/i, icono: "flecha", label: "LINK EN BIO" },
];
// Posiciones seguras (esquinas/lados; el centro es tu cara, abajo van los subs).
const POS = [
  { x: 660, y: 470 }, { x: 120, y: 540 }, { x: 690, y: 900 },
  { x: 120, y: 980 }, { x: 640, y: 470 }, { x: 130, y: 560 }, { x: 680, y: 900 },
];

type CalloutData = { atFrame: number; x: number; y: number; text?: string; icono?: IconoNombre; objeto?: string; lottie?: string; label?: string; grande?: boolean; entrada?: number };
const construirCallouts = (captions: Caption[], fps: number, extra: Regla[] = []): CalloutData[] => {
  const found: (Omit<Regla, "re"> & { atMs: number })[] = [];
  // Reglas del tema (guion) primero, luego las genéricas de marca.
  for (const r of [...extra, ...REGLAS]) {
    const cap = captions.find((c) => r.re.test(c.text));
    if (cap) found.push({ text: r.text, icono: r.icono, objeto: r.objeto, lottie: r.lottie, label: r.label, grande: r.grande, atMs: cap.startMs });
  }
  found.sort((a, b) => a.atMs - b.atMs);
  // separar en el tiempo (mínimo ~1.4s) y asignar posición alternada.
  // Arrancan después de que el título gancho se va (~5.5s), para no pisarse.
  const out: CalloutData[] = [];
  let lastMs = 5500;
  let i = 0;
  for (const f of found) {
    if (f.atMs < 5600) continue;
    if (f.atMs - lastMs < 1400) continue;
    lastMs = f.atMs;
    const p = POS[i % POS.length];
    out.push({ atFrame: Math.round((f.atMs / 1000) * fps), x: p.x, y: p.y, text: f.text, icono: f.icono, objeto: f.objeto, lottie: f.lottie, label: f.label, grande: f.grande, entrada: i % 4 });
    i++;
  }
  return out;
};

// Carga y reproduce un .json de Lottie (de public/lottie/). La opción animada.
const LottieObj: React.FC<{ file: string; size: number }> = ({ file, size }) => {
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [h] = React.useState(() => delayRender("lottie"));
  React.useEffect(() => {
    fetch(staticFile(`lottie/${file}`))
      .then((r) => r.json())
      .then((j) => { setData(j); continueRender(h); })
      .catch((e) => cancelRender(e));
  }, [file, h]);
  return data ? <Lottie animationData={data} style={{ width: size, height: size }} /> : null;
};

const Callout: React.FC<CalloutData> = ({ atFrame, x, y, text, icono, objeto, lottie, label, grande, entrada = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = 78;
  const t = frame - atFrame;
  if (t < 0 || t > dur) return null;
  const pop = spring({ frame: t, fps, config: { damping: 12, stiffness: 130 } });
  const vis = interpolate(t, [0, 6, dur - 14, dur], [0, 1, 1, 0], clamp);
  const bob = Math.sin(t / 14) * 8;
  // Entrada variable (0-3) para que no todos los objetos aparezcan igual:
  // 0 = pop clásico · 1 = entra de la izquierda · 2 = de la derecha · 3 = girando
  const sc = interpolate(pop, [0, 1], [0.5, 1]);
  const inX = interpolate(pop, [0, 1], [entrada === 1 ? -90 : entrada === 2 ? 90 : 0, 0]);
  const rot = entrada === 3 ? interpolate(pop, [0, 1], [-22, -3]) : -3;
  const wrap: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    opacity: vis,
    transform: `translate(${inX}px, ${bob}px) scale(${sc}) rotate(${rot}deg)`,
    filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.5))",
  };

  const Etiqueta = () =>
    label ? (
      <div style={{ background: BRAND.yellow, color: BRAND.ink, fontFamily: FONTS.display, fontSize: 44, padding: "6px 18px", borderRadius: 10 }}>{label}</div>
    ) : null;

  // ANIMACIÓN Lottie (public/lottie/*.json) — la opción animada
  if (lottie) {
    return (
      <div style={{ ...wrap, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <LottieObj file={lottie} size={grande ? 300 : 230} />
        <Etiqueta />
      </div>
    );
  }

  // OBJETO 3D/foto (PNG en public/objetos/) — flota con su etiqueta
  if (objeto) {
    return (
      <div style={{ ...wrap, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Img src={staticFile(`objetos/${objeto}`)} style={{ width: grande ? 300 : 230, height: "auto" }} />
        <Etiqueta />
      </div>
    );
  }

  // OBJETO (ícono de marca vectorial) en un panel oscuro — respaldo si no hay PNG
  if (icono && ICONOS[icono]) {
    return (
      <div style={{ ...wrap, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ background: "rgba(10,22,46,0.82)", border: `4px solid ${BRAND.yellow}`, borderRadius: 22, padding: 22 }}>
          {ICONOS[icono](130)}
        </div>
        {label && <div style={{ background: BRAND.yellow, color: BRAND.ink, fontFamily: FONTS.display, fontSize: 44, padding: "6px 18px", borderRadius: 10 }}>{label}</div>}
      </div>
    );
  }

  // Placa de TEXTO
  return (
    <div
      style={{
        ...wrap,
        background: BRAND.yellow,
        color: BRAND.ink,
        fontFamily: FONTS.display,
        fontSize: grande ? 96 : 56,
        padding: grande ? "12px 30px" : "10px 22px",
        borderRadius: 16,
      }}
    >
      {text}
    </div>
  );
};

const Footer: React.FC = () => (
  <div style={{ position: "absolute", left: MARGIN, bottom: 120, display: "flex", alignItems: "center", gap: 12 }}>
    <img src={staticFile("logo.png")} style={{ width: 44, height: 44 }} />
    <span style={{ color: BRAND.paper, fontFamily: FONTS.mono, fontSize: 26, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>skool.com/easymeli</span>
  </div>
);

// ── "VIBE" del video: mezcla según el video ─────────────────────────────
// En vez de que todos los videos usen los mismos efectos, cada video tiene un
// "vibe" que decide de golpe: estilo de cámara + qué efectos visuales prenden.
//   · calmado    → cámara reposada, viñeta + grano, sin flash/shake (premium)
//   · energetico → cámara dinámica, flash + shake + jump-cut (ritmo TikTok)
//   · epico      → cámara agresiva, todo al máximo
//   · auto       → elige uno de los tres por semilla (varía por video, estable)
export type Vibe = "auto" | "calmado" | "energetico" | "epico";
type EfectosCfg = { grain: number; vignette: number; flash: boolean; shake: number; jumpCut: boolean; float: number };

const VIBES: Record<Exclude<Vibe, "auto">, { estilo: EstiloCamara; efectos: EfectosCfg }> = {
  calmado: { estilo: "reposado", efectos: { grain: 0.05, vignette: 0.5, flash: false, shake: 0, jumpCut: false, float: 0.45 } },
  energetico: { estilo: "dinamico", efectos: { grain: 0.04, vignette: 0.35, flash: true, shake: 0.6, jumpCut: true, float: 0.7 } },
  epico: { estilo: "agresivo", efectos: { grain: 0.06, vignette: 0.55, flash: true, shake: 1.0, jumpCut: true, float: 0.5 } },
};
const hashVibe = (s: string): number => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const resolverVibe = (vibe: Vibe, seed: string) => {
  if (vibe !== "auto") return VIBES[vibe];
  const keys: Exclude<Vibe, "auto">[] = ["calmado", "energetico", "epico"];
  return VIBES[keys[hashVibe(seed) % 3]];
};

// Capa de efectos visuales (encima del footage, debajo de textos): viñeta fija,
// grano de película animado y flash blanco corto en cada golpe/objeto.
const EffectsLayer: React.FC<{ efectos: EfectosCfg; punchFrames: number[] }> = ({ efectos, punchFrames }) => {
  const frame = useCurrentFrame();
  let flashOp = 0;
  if (efectos.flash) {
    for (const cf of punchFrames) {
      if (frame >= cf - 1 && frame < cf + 4) flashOp = Math.max(flashOp, interpolate(frame, [cf - 1, cf, cf + 4], [0, 0.34, 0], clamp));
    }
  }
  return (
    <>
      {efectos.vignette > 0 && (
        <AbsoluteFill style={{ background: `radial-gradient(125% 115% at 50% 44%, transparent 52%, rgba(3,8,20,${efectos.vignette}) 100%)`, pointerEvents: "none" }} />
      )}
      {efectos.grain > 0 && (
        <AbsoluteFill style={{ opacity: efectos.grain, mixBlendMode: "overlay", pointerEvents: "none" }}>
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 90} stitchTiles="stitch" /></filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
        </AbsoluteFill>
      )}
      {flashOp > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flashOp, pointerEvents: "none" }} />}
    </>
  );
};

// Textos editables del video (se cambian desde el panel de Studio o por --props).
// Nombres en español para que se lean claros en el panel.
export type TextosVideo = {
  tituloArriba: string;
  tituloAbajo: string;
  placa: string;
  alturaSubtitulos: number;
  tamanoLetra: number;
  estiloSubtitulos: "limpio" | "resaltado";
  estiloCamara: EstiloCamara;
  vibe: Vibe;
};

export const TEXTOS_DEFAULT: TextosVideo = {
  tituloArriba: "VENDES EN MERCADOLIBRE",
  tituloAbajo: "Y TU MARGEN NO CIERRA",
  placa: "-20%",
  alturaSubtitulos: 300,
  tamanoLetra: 60,
  estiloSubtitulos: "limpio",
  estiloCamara: "auto",
  vibe: "auto",
};

// Footage con efectos de cámara (zoom lento + "punch" periódico) + capas.
const FootageEditado: React.FC<{ footage: string; footageFrames: number; captions?: Caption[]; textos: TextosVideo; reglasExtra?: Regla[] }> = ({ footage, footageFrames, captions, textos, reglasExtra }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const callouts = React.useMemo(() => (captions ? construirCallouts(captions, fps, reglasExtra) : []), [captions, fps, reglasExtra]);
  const punchFrames = React.useMemo(() => callouts.map((c) => c.atFrame), [callouts]);
  // "Vibe" del video → decide estilo de cámara + efectos (mezcla por video).
  const vibeCfg = React.useMemo(() => resolverVibe(textos.vibe ?? "auto", footage), [textos.vibe, footage]);
  // Un estilo manual (≠ auto) manda sobre el del vibe; si es "auto", decide el vibe.
  const estilo = textos.estiloCamara && textos.estiloCamara !== "auto" ? textos.estiloCamara : vibeCfg.estilo;
  // Cámara virtual: movimientos que varían por segmento y por video (semilla =
  // nombre del footage), con golpes/shake/jump-cut sincronizados a la voz.
  const cam = camara({
    seed: footage,
    frame,
    total: footageFrames,
    fps,
    estilo,
    punchFrames,
    float: vibeCfg.efectos.float,
    shake: vibeCfg.efectos.shake,
    jumpCut: vibeCfg.efectos.jumpCut,
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{
transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`,
transformOrigin: "50% 42%",
color: "#ffffff"
}}>
        <OffthreadVideo src={staticFile(footage)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {/* efectos visuales (viñeta, grano, flash) según el vibe */}
      <EffectsLayer efectos={vibeCfg.efectos} punchFrames={punchFrames} />
      {/* scrim arriba y abajo para que los textos se lean */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(6,12,26,0.82) 0%, transparent 24%, transparent 60%, rgba(6,12,26,0.5) 100%)" }} />
      <BrandHeader />
      <TituloGancho lineas={[{ t: textos.tituloArriba }, { t: textos.tituloAbajo, hot: true }]} />
      {/* animaciones a lo largo de TODO el video, sincronizadas con la voz */}
      {callouts.map((c, i) => (
        <Callout key={i} {...c} />
      ))}
      {captions && captions.length > 0 && <Subtitulos captions={captions} bottom={textos.alturaSubtitulos} font={textos.tamanoLetra} estilo={textos.estiloSubtitulos} />}
      <Footer />
    </AbsoluteFill>
  );
};

// CTA VISUAL: tu captura de pantalla real + una flecha que rebota y un anillo
// que pulsa señalando EXACTAMENTE a dónde ir (regla de guion-grabacion.md: el
// CTA final siempre es visual). Target en coords normalizadas del cuadro (0-1).
const CTACaptura: React.FC<{ archivo: string; target: { x: number; y: number } }> = ({ archivo, target }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });
  const tx = target.x * 1080;
  const ty = target.y * 1920;
  const cyc = (frame % 42) / 42;
  const ringScale = interpolate(cyc, [0, 1], [0.7, 1.7]);
  const ringOp = interpolate(cyc, [0, 0.5, 1], [0.95, 0.4, 0], clamp);
  const bob = Math.sin(frame / 7) * 14;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 40%, ${BRAND.inkHi} 0%, ${BRAND.ink} 65%)` }}>
      <div style={{ position: "absolute", top: 150, left: MARGIN, right: MARGIN, textAlign: "center", opacity: inn }}>
        <div style={{ color: BRAND.paper, fontFamily: FONTS.display, fontSize: 78, lineHeight: 1.04 }}>EL LINK ESTÁ</div>
        <div style={{ color: BRAND.yellow, fontFamily: FONTS.display, fontSize: 78, lineHeight: 1.04 }}>EN MI PERFIL</div>
      </div>
      {/* captura enmarcada */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 360, bottom: 300, borderRadius: 28, overflow: "hidden", border: `4px solid ${BRAND.line}`, boxShadow: "0 30px 80px rgba(0,0,0,0.55)", opacity: inn, transform: `scale(${interpolate(inn, [0, 1], [0.94, 1])})` }}>
        <Img src={staticFile(archivo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* anillo que pulsa en el target */}
      <div style={{ position: "absolute", left: tx - 70, top: ty - 70, width: 140, height: 140, borderRadius: "50%", border: `6px solid ${BRAND.yellow}`, transform: `scale(${ringScale})`, opacity: ringOp }} />
      <div style={{ position: "absolute", left: tx - 46, top: ty - 46, width: 92, height: 92, borderRadius: "50%", border: `5px solid ${BRAND.yellow}`, boxShadow: `0 0 24px ${BRAND.yellow}` }} />
      {/* flecha que rebota apuntando al target */}
      <div style={{ position: "absolute", left: tx - 26, top: ty - 168 + bob, opacity: inn }}>
        <svg width="52" height="86" viewBox="0 0 52 86"><path d="M26 6 V64 M8 44 L26 68 L44 44" fill="none" stroke={BRAND.yellow} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

const CTACard: React.FC<{ capturaArchivo?: string; capturaTarget?: { x: number; y: number } }> = ({ capturaArchivo, capturaTarget }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const pulse = spring({ frame: frame - 16, fps, config: { damping: 11, stiffness: 90 } });
  if (capturaArchivo) return <CTACaptura archivo={capturaArchivo} target={capturaTarget ?? { x: 0.5, y: 0.42 }} />;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 40%, ${BRAND.inkHi} 0%, ${BRAND.ink} 65%)`, justifyContent: "center", alignItems: "center", padding: MARGIN }}>
      <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`, textAlign: "center" }}>
        <div style={{ color: BRAND.paper, fontFamily: FONTS.display, fontSize: 88, lineHeight: 1.05 }}>¿PERDIENDO PLATA</div>
        <div style={{ color: BRAND.yellow, fontFamily: FONTS.display, fontSize: 88, lineHeight: 1.05 }}>SIN SABERLO?</div>
        <div style={{ marginTop: 40, color: BRAND.paper, fontFamily: FONTS.body, fontSize: 58 }}>Te espero en la comunidad</div>
        <div
          style={{
            marginTop: 30,
            display: "inline-block",
            border: `5px solid ${BRAND.yellow}`,
            borderRadius: 16,
            padding: "18px 40px",
            color: BRAND.yellow,
            fontFamily: FONTS.mono,
            fontSize: 40,
            opacity: interpolate(pulse, [0, 1], [0, 1]),
            transform: `scale(${interpolate(pulse, [0, 1], [0.7, 1])})`,
          }}
        >
          LINK EN MI PERFIL ↑
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Esquema para los controles del panel de Remotion Studio. El grupo "textos"
// sale como deslizadores/campos editables. Los campos técnicos (footage,
// captions, etc.) también van, pero se ignoran desde el panel.
export const videoHabladoSchema = z.object({
  textos: z.object({
    tituloArriba: z.string().describe("Título gancho — línea de arriba"),
    tituloAbajo: z.string().describe("Título gancho — línea de abajo (amarilla)"),
    placa: z.string().describe("Texto de la placa (ej: -20%)"),
    // Subir/bajar los subtítulos: MÁS = más arriba, MENOS = más abajo
    alturaSubtitulos: z.number().min(120).max(1500).step(10).describe("Altura de los subtítulos (más = más arriba)"),
    tamanoLetra: z.number().min(30).max(120).step(2).describe("Tamaño de letra de los subtítulos"),
    estiloSubtitulos: z.enum(["limpio", "resaltado"]).describe("Estilo de los subtítulos"),
    estiloCamara: z.enum(["auto", "reposado", "dinamico", "agresivo"]).describe("Movimiento de cámara (auto = lo decide el vibe)"),
    vibe: z.enum(["auto", "calmado", "energetico", "epico"]).describe("Vibe del video: cámara + efectos (auto = varía solo por video)"),
  }),
  footage: z.string(),
  footageFrames: z.number(),
  introArchivo: z.string(),
  captionsFile: z.string(),
  capturaArchivo: z.string().describe("Captura para el CTA final (public/capturas/..). Vacío = tarjeta de texto"),
  capturaTargetX: z.number().min(0).max(1).step(0.01).describe("Dónde apunta la flecha del CTA (izq→der)"),
  capturaTargetY: z.number().min(0).max(1).step(0.01).describe("Dónde apunta la flecha del CTA (arriba→abajo)"),
  // Reglas de objetos del TEMA (JSON string, se parsea en runtime → no rompe el panel)
  reglasExtra: z.string().describe('Objetos del tema, JSON: [{"palabras":"reloj|tiempo","objeto":"reloj.png","label":"TIEMPO"}]'),
});

export type VideoHabladoProps = { footage: string; footageFrames: number; introArchivo?: string; captionsFile?: string; textos?: TextosVideo; capturaArchivo?: string; capturaTargetX?: number; capturaTargetY?: number; reglasExtra?: string };

const T = 12;
const INTRO = 60;
const CTA = 90;

export const videoHabladoDuration = (footageFrames: number, hasIntro: boolean) => {
  const parts = [hasIntro ? INTRO : 0, footageFrames, CTA].filter((n) => n > 0);
  return parts.reduce((a, b) => a + b, 0) - (parts.length - 1) * T;
};

export const VideoHablado: React.FC<VideoHabladoProps> = ({ footage, footageFrames, introArchivo, captionsFile, textos = TEXTOS_DEFAULT, capturaArchivo, capturaTargetX = 0.5, capturaTargetY = 0.42, reglasExtra: reglasExtraStr }) => {
  // Reglas de objetos del tema: llegan como JSON string y se convierten a RegExp.
  const reglasExtra = React.useMemo<Regla[]>(() => {
    try {
      const arr = JSON.parse(reglasExtraStr || "[]");
      return (Array.isArray(arr) ? arr : []).map((r: { palabras: string; objeto?: string; icono?: IconoNombre; label?: string; text?: string; grande?: boolean }) => ({
        re: new RegExp(r.palabras, "i"), objeto: r.objeto, icono: r.icono, label: r.label, text: r.text, grande: r.grande,
      }));
    } catch { return []; }
  }, [reglasExtraStr]);
  const timing = linearTiming({ durationInFrames: T });

  // Los subtítulos se cargan desde un archivo (no como lista en props): así el
  // panel de Studio no se rompe con una lista enorme, y sigue funcionando por
  // --props (una ruta simple).
  const [captions, setCaptions] = React.useState<Caption[]>([]);
  const [handle] = React.useState(() => (captionsFile ? delayRender("subtitulos") : null));
  React.useEffect(() => {
    if (!captionsFile || handle === null) return;
    fetch(staticFile(captionsFile))
      .then((r) => r.json())
      .then((d) => { setCaptions(d as Caption[]); continueRender(handle); })
      .catch((e) => cancelRender(e));
  }, [captionsFile, handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink }}>
      <TransitionSeries>
        {introArchivo && (
          <TransitionSeries.Sequence durationInFrames={INTRO}>
            <Intro archivo={introArchivo} dur={INTRO} />
          </TransitionSeries.Sequence>
        )}
        {introArchivo && <TransitionSeries.Transition presentation={fade()} timing={timing} />}

        <TransitionSeries.Sequence durationInFrames={footageFrames}>
          <FootageEditado footage={footage} footageFrames={footageFrames} captions={captions} textos={textos} reglasExtra={reglasExtra} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={CTA}>
          <CTACard capturaArchivo={capturaArchivo} capturaTarget={{ x: capturaTargetX, y: capturaTargetY }} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
