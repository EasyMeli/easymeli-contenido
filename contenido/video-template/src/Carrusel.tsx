import React from "react";
import { Easing, Audio, Sequence, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { Portada } from "./Portada";
import { Escena } from "./Escena";
import { Intro } from "./Intro";
import { PRESETS, PresetCtx, TransPack } from "./presets";
import { Guion, palabrasEscena, parseGuion } from "./guion";
import cuponesJson from "../temas/cupones/cupones.json";

const FPS = 30;

// Guion por defecto: el contenido vive en guiones/cupones.json. Para un
// video nuevo, se copia ese archivo, se cambian los textos, y listo.
// parseGuion valida el JSON al cargar: si algo está mal (campo que falta,
// layout mal escrito), avisa con un mensaje claro en vez de romper el render.
export const CUPONES = parseGuion(cuponesJson, "cupones.json");

// Transición estándar: 16 frames, easing suave pero snappy.
const T = 16;
const timing = linearTiming({ durationInFrames: T, easing: Easing.inOut(Easing.cubic) });

// Packs de transición: cada preset tiene el suyo (5 transiciones).
const PACKS: Record<TransPack, React.ReactElement["props"]["presentation"][]> = {
  slide: [
    slide({ direction: "from-bottom" }),
    slide({ direction: "from-left" }),
    slide({ direction: "from-bottom" }),
    slide({ direction: "from-right" }),
    slide({ direction: "from-bottom" }),
  ],
  wipe: [
    wipe({ direction: "from-right" }),
    wipe({ direction: "from-bottom" }),
    wipe({ direction: "from-left" }),
    wipe({ direction: "from-right" }),
    wipe({ direction: "from-bottom" }),
  ],
  mix: [slide({ direction: "from-bottom" }), fade(), wipe({ direction: "from-right" }), fade(), slide({ direction: "from-bottom" })],
};

// --- Duración por lectura (ver references/video.md) ---
const READ_WPS = 3.3;
const ENTER = 0.7;
const HOLD = 0.6;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const readFrames = (words: number) => clamp(Math.round(FPS * (ENTER + words / READ_WPS + HOLD)), 100, 220);

const portadaWords = (g: Guion) => g.portada.amenaza.map((l) => l.text).join(" ").split(/\s+/).filter(Boolean).length;

// Duración del clip intro (imagen IA con efectos), ~2.1s.
export const INTRO_DUR = 64;

// Duración de cada slide de contenido, calculada del texto del guion.
const dursOf = (g: Guion) => [readFrames(portadaWords(g)), ...g.escenas.map((e) => readFrames(palabrasEscena(e)))];

// Duraciones completas: si hay intro (imagen generada), va primero.
const fullDurs = (g: Guion) => (g.intro?.archivo ? [INTRO_DUR, ...dursOf(g)] : dursOf(g));

export const durationOf = (g: Guion) => {
  const d = fullDurs(g);
  return d.reduce((a, b) => a + b, 0) - (d.length - 1) * T;
};

// Duración de la composición (usa el guion por defecto).
export const CARRUSEL_DURATION = durationOf(CUPONES);

// Frames globales de cada transición, derivados de las duraciones.
const transStartOf = (dur: number[]) => {
  const out: number[] = [];
  let start = 0;
  for (let i = 1; i < dur.length; i++) {
    start += dur[i - 1] - T;
    out.push(start);
  }
  return out;
};

// Música de fondo: pista original de suspenso/intriga (libre de derechos).
// Un impacto grave marca cada transición, en sintonía con la tensión.
const Music: React.FC<{ transStart: number[] }> = ({ transStart }) => (
  <>
    <Audio src={staticFile("sfx/suspense.wav")} volume={0.55} />
    {transStart.map((f) => (
      <Sequence key={`i${f}`} from={f + T}>
        <Audio src={staticFile("sfx/impact.wav")} volume={0.35} />
      </Sequence>
    ))}
  </>
);

export type CarruselProps = { presetKey: keyof typeof PRESETS; guion?: Guion };

export const Carrusel: React.FC<CarruselProps> = ({ presetKey, guion = CUPONES }) => {
  const preset = PRESETS[presetKey];
  const pack = PACKS[preset.transPack];
  const dur = fullDurs(guion);
  const transStart = transStartOf(dur);

  const total = guion.escenas.length + 1;
  const contenido = [
    <Portada handle={guion.handle} amenaza={guion.portada.amenaza} numero={guion.portada.numero} pregunta={guion.portada.pregunta} />,
    ...guion.escenas.map((e, i) => <Escena key={i} data={e} n={i + 2} total={total} />),
  ];
  // Si hay intro (imagen IA), va primero, con un fundido suave hacia el hook.
  const hasIntro = Boolean(guion.intro?.archivo);
  const scenes = hasIntro ? [<Intro archivo={guion.intro!.archivo!} dur={INTRO_DUR} />, ...contenido] : contenido;
  const trans = hasIntro ? [fade(), ...pack] : pack;

  return (
    <PresetCtx.Provider value={preset}>
      {/* motion-blur: da estela al movimiento (transiciones y entradas),
          se ve suave y premium. Lo estático queda nítido. */}
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <TransitionSeries>
          {scenes.map((node, i) => (
            <React.Fragment key={i}>
              {i > 0 && <TransitionSeries.Transition presentation={trans[i - 1]} timing={timing} />}
              <TransitionSeries.Sequence durationInFrames={dur[i]}>{node}</TransitionSeries.Sequence>
            </React.Fragment>
          ))}
        </TransitionSeries>
      </CameraMotionBlur>
      <Music transStart={transStart} />
    </PresetCtx.Provider>
  );
};
