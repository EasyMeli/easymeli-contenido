import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { BRAND, FONTS } from "./brand";
import { SceneBg } from "./ui";

// DEMO de "cosas flotando" PROFESIONALES (motion graphics de marca, sin emojis
// genéricos). Cada elemento es una pieza diseñada en la paleta Easy Meli
// (navy + amarillo, vectorial, con sombra), que flota, deriva y rota suave.
// Esto va encima del video hablando: chips de dato, íconos, mini-tarjetas.
const Floaty: React.FC<{
  x: number;
  y: number;
  delay: number;
  amp: number;
  period: number;
  rot: number;
  children: React.ReactNode;
}> = ({ x, y, delay, amp, period, rot, children }) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  const bob = Math.sin(t / period) * amp;
  const drift = Math.cos(t / (period * 1.6)) * (amp * 0.45);
  const wobble = Math.sin(t / (period * 0.85)) * rot;
  const appear = interpolate(t, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: appear,
        transform: `translate(${drift}px, ${bob}px) rotate(${wobble}deg) scale(${appear})`,
        filter: "drop-shadow(0 12px 26px rgba(0,0,0,0.5))",
      }}
    >
      {children}
    </div>
  );
};

// --- Piezas de marca (vectoriales) --------------------------------------
const Chip: React.FC<{ text: string; solid?: boolean }> = ({ text, solid }) => (
  <div
    style={{
      background: solid ? BRAND.yellow : "transparent",
      color: solid ? BRAND.ink : BRAND.yellow,
      border: solid ? "none" : `4px solid ${BRAND.yellow}`,
      fontFamily: FONTS.display,
      fontSize: 84,
      padding: "14px 34px",
      borderRadius: 18,
      lineHeight: 1,
    }}
  >
    {text}
  </div>
);

// Ícono de cupón/etiqueta (línea, estilo marca)
const TagIcon: React.FC<{ s?: number }> = ({ s = 150 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
    <path d="M52 8 L92 8 L92 48 L48 92 L8 52 Z" stroke={BRAND.yellow} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={74} cy={26} r={8} stroke={BRAND.yellow} strokeWidth={6} />
  </svg>
);

// Mini-tarjeta con barras (dato) en panel de marca
const MiniChart: React.FC = () => (
  <div style={{ background: BRAND.panel, border: `3px solid ${BRAND.line}`, borderRadius: 18, padding: 26, display: "flex", alignItems: "flex-end", gap: 16, height: 150 }}>
    {[40, 70, 55, 96].map((h, i) => (
      <div key={i} style={{ width: 26, height: h, background: i === 3 ? BRAND.yellow : BRAND.muted, borderRadius: 6 }} />
    ))}
  </div>
);

// Flecha de marca
const Arrow: React.FC = () => (
  <svg width={170} height={90} viewBox="0 0 170 90" fill="none">
    <path d="M8 45 L150 45 M120 18 L152 45 L120 72" stroke={BRAND.yellow} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FloatDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = spring({ frame: frame - 22, fps, config: { damping: 11, stiffness: 90 } });

  return (
    <SceneBg>
      <div style={{ position: "absolute", left: 112, top: 340, width: 856 }}>
        <div style={{ color: BRAND.paper, fontFamily: FONTS.display, fontSize: 118, lineHeight: 1 }}>ELEMENTOS</div>
        <div style={{ color: BRAND.yellow, fontFamily: FONTS.display, fontSize: 118, lineHeight: 1 }}>DE TU MARCA</div>
        <div style={{ color: BRAND.muted, fontFamily: FONTS.body, fontSize: 60, marginTop: 20 }}>
          diseñados, no emojis. Van sobre tu video.
        </div>
      </div>

      {/* círculo de resalte animado (señala algo en pantalla) */}
      <div
        style={{
          position: "absolute",
          left: 660,
          top: 1200,
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: `10px solid ${BRAND.yellow}`,
          opacity: interpolate(pulse, [0, 1], [0, 0.85]),
          transform: `scale(${interpolate(pulse, [0, 1], [0.4, 1])})`,
        }}
      />

      <Floaty x={130} y={1120} delay={0} amp={26} period={16} rot={5}>
        <Chip text="-20%" solid />
      </Floaty>
      <Floaty x={800} y={760} delay={8} amp={30} period={20} rot={4}>
        <TagIcon s={150} />
      </Floaty>
      <Floaty x={150} y={1480} delay={16} amp={22} period={15} rot={3}>
        <MiniChart />
      </Floaty>
      <Floaty x={720} y={1420} delay={24} amp={28} period={18} rot={6}>
        <Chip text="MARGEN" />
      </Floaty>
      <Floaty x={470} y={980} delay={32} amp={30} period={17} rot={7}>
        <Arrow />
      </Floaty>
    </SceneBg>
  );
};
