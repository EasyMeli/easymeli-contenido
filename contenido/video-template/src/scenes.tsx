import React from "react";
import { BRAND, FONTS } from "./brand";
import { SceneBg, Header, Footer, Reveal, Stage, fitWidth } from "./ui";
import { TextColor } from "./guion";

// Ladrillos de contenido en FLUJO (sin top fijo): el gap del Stage garantiza
// la separación y `fitWidth` mide el texto para que no toque el margen.
// El renderer de escenas (Escena.tsx) los combina según el layout del guion.

export const colorOf = (c?: TextColor): string =>
  c === "yellow" ? BRAND.yellow : c === "paper" ? BRAND.paper : BRAND.muted;

export const Title: React.FC<{ text: string; size: number; color?: string; delay?: number }> = ({
  text,
  size,
  color = BRAND.paper,
  delay = 0,
}) => (
  <Reveal delay={delay}>
    <div style={{ color, fontSize: fitWidth(text, FONTS.display, size), lineHeight: 1.03 }}>{text}</div>
  </Reveal>
);

export const Body: React.FC<{ text: string; color?: string; size?: number; delay?: number }> = ({
  text,
  color = BRAND.muted,
  size = 82,
  delay = 8,
}) => (
  <Reveal delay={delay}>
    <div style={{ color, fontFamily: FONTS.body, fontSize: fitWidth(text, FONTS.body, size), lineHeight: 1.08 }}>{text}</div>
  </Reveal>
);

export const Rule: React.FC<{ delay?: number }> = ({ delay = 10 }) => (
  <Reveal delay={delay}>
    <div style={{ height: 4, width: "100%", background: BRAND.line }} />
  </Reveal>
);

export const Row: React.FC<{ left: string; right: string; delay: number; big?: boolean }> = ({
  left,
  right,
  delay,
  big,
}) => (
  <Reveal delay={delay}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        borderBottom: big ? "none" : `2px solid ${BRAND.line}`,
        paddingBottom: big ? 0 : 18,
      }}
    >
      <span style={big ? { fontSize: 80, color: BRAND.paper } : { fontFamily: FONTS.mono, fontSize: 38, color: BRAND.muted }}>
        {left}
      </span>
      <span style={big ? { fontSize: 80, color: BRAND.yellow } : { fontFamily: FONTS.mono, fontSize: 38, color: BRAND.paper }}>
        {right}
      </span>
    </div>
  </Reveal>
);

// ---- Layouts completos que se usan tal cual (y como demo en Root) ----

// NÚMERO GIGANTE centrado — forma D ("el número que nadie te dice").
export const BigNumber: React.FC<{ kicker: string; n: number; label: string; number: string; caption: string; total?: number }> = ({
  kicker,
  n,
  label,
  number,
  caption,
  total,
}) => (
  <SceneBg>
    <Header kicker={kicker} n={n} total={total} />
    <Stage gap={24}>
      <Reveal>
        <div style={{ color: BRAND.muted, fontFamily: FONTS.mono, fontSize: 40, letterSpacing: 2 }}>{label}</div>
      </Reveal>
      <Reveal delay={6}>
        <div style={{ color: BRAND.yellow, fontSize: fitWidth(number, FONTS.display, 430), lineHeight: 0.9 }}>{number}</div>
      </Reveal>
      <Reveal delay={14}>
        <div style={{ color: BRAND.paper, fontFamily: FONTS.body, fontSize: fitWidth(caption, FONTS.body, 84), lineHeight: 1.06 }}>{caption}</div>
      </Reveal>
    </Stage>
    <Footer />
  </SceneBg>
);

// CITA / TESTIMONIO — para "me pasó a mí" o el resultado de un tercero.
export const Quote: React.FC<{ kicker: string; n: number; text: string; author: string; total?: number }> = ({
  kicker,
  n,
  text,
  author,
  total,
}) => (
  <SceneBg>
    <Header kicker={kicker} n={n} total={total} />
    <Stage gap={20}>
      <Reveal>
        <div style={{ color: BRAND.yellow, fontSize: 240, lineHeight: 0.55, fontFamily: FONTS.display }}>“</div>
      </Reveal>
      <Reveal delay={6}>
        <div style={{ color: BRAND.paper, fontSize: fitWidth(text, FONTS.display, 92), lineHeight: 1.06 }}>{text}</div>
      </Reveal>
      <Reveal delay={14}>
        <div style={{ color: BRAND.muted, fontFamily: FONTS.mono, fontSize: 36 }}>— {author}</div>
      </Reveal>
    </Stage>
    <Footer />
  </SceneBg>
);
