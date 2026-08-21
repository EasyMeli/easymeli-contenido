import React from "react";
import { Easing, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { Portada } from "./Portada";
import { Escena } from "./Escena";
import { Intro } from "./Intro";
import { PRESETS, PresetCtx } from "./presets";
import { Guion, EscenaData, parseGuion } from "./guion";
import cuponesJson from "../temas/cupones/cupones.json";

// El CORTO es el mismo guion recortado a ~10s: (intro) + portada + golpe +
// cierre. Sirve para "calentar" la cuenta y como gancho rápido.
const T = 14;
const INTRO_DUR = 48; // intro más corta en el corto (~1.6s)

// Selección: el "golpe" (el desglose o el número, si existen) + el cierre.
export const seleccionCorto = (g: Guion): EscenaData[] => {
  const golpe = g.escenas.find((e) => e.layout === "desglose" || e.layout === "numero") ?? g.escenas[0];
  const cierre = [...g.escenas].reverse().find((e) => e.layout === "cierre") ?? g.escenas[g.escenas.length - 1];
  const sel = [golpe];
  if (cierre && cierre !== golpe) sel.push(cierre);
  return sel;
};

// Duraciones fijas y cortas (frames): portada, golpe, cierre. Total ~9-10s.
const DUR = [96, 132, 96];

export const cortoDurationOf = (g: Guion) => {
  const base = DUR.slice(0, 1 + seleccionCorto(g).length);
  const d = g.intro?.archivo ? [INTRO_DUR, ...base] : base;
  return d.reduce((a, b) => a + b, 0) - (d.length - 1) * T;
};

export const CORTO_DURATION = cortoDurationOf(parseGuion(cuponesJson, "cupones.json"));

const timing = linearTiming({ durationInFrames: T, easing: Easing.inOut(Easing.cubic) });

export type CortoProps = { presetKey: keyof typeof PRESETS; guion?: Guion };

export const Corto: React.FC<CortoProps> = ({ presetKey, guion = parseGuion(cuponesJson, "cupones.json") }) => {
  const preset = PRESETS[presetKey];
  const sel = seleccionCorto(guion);
  const total = sel.length + 1;
  const contenido = [
    <Portada handle={guion.handle} amenaza={guion.portada.amenaza} numero={guion.portada.numero} pregunta={guion.portada.pregunta} />,
    ...sel.map((e, i) => <Escena key={i} data={e} n={i + 2} total={total} />),
  ];
  const hasIntro = Boolean(guion.intro?.archivo);
  const nodes = hasIntro ? [<Intro archivo={guion.intro!.archivo!} dur={INTRO_DUR} />, ...contenido] : contenido;
  const dur = (hasIntro ? [INTRO_DUR, ...DUR.slice(0, contenido.length)] : DUR.slice(0, contenido.length));

  return (
    <PresetCtx.Provider value={preset}>
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <TransitionSeries>
          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <TransitionSeries.Transition
                  presentation={hasIntro && i === 1 ? fade() : slide({ direction: "from-bottom" })}
                  timing={timing}
                />
              )}
              <TransitionSeries.Sequence durationInFrames={dur[i]}>{node}</TransitionSeries.Sequence>
            </React.Fragment>
          ))}
        </TransitionSeries>
      </CameraMotionBlur>
      <Audio src={staticFile("sfx/suspense.wav")} volume={0.5} />
    </PresetCtx.Provider>
  );
};
