import React, { useContext } from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BRAND, FONTS } from "./brand";
import { SceneBg, MARGIN, fitLine } from "./ui";
import { PresetCtx } from "./presets";

// La portada son textos de UNA sola línea (sin wrap): se mide la línea
// completa para que ninguna pase el margen seguro.
const fit = (text: string, base: number) => fitLine(text, FONTS.display, base);

export type PortadaProps = {
  handle: string;
  amenaza: { text: string; hot?: boolean }[];
  numero: { over: string; num: string; sub1: string; sub2: string };
  pregunta: { top: string; ring: string; bottom: string[] };
};

// Marca mínima de portada: logo chico + wordmark + handle. Sin badge.
const BrandMin: React.FC<{ handle: string }> = ({ handle }) => (
  <>
    <div style={{ position: "absolute", left: MARGIN, top: 92, display: "flex", alignItems: "center", gap: 20 }}>
      <Img src={staticFile("logo.png")} style={{ width: 84, height: 84 }} />
      <span style={{ color: BRAND.paper, fontSize: 34, letterSpacing: 1 }}>EASY MELI</span>
    </div>
    <div
      style={{ position: "absolute", left: MARGIN, top: 1740, color: BRAND.muted, fontFamily: FONTS.mono, fontSize: 30 }}
    >
      {handle}
    </div>
  </>
);

export const Portada: React.FC<PortadaProps> = (props) => {
  const preset = useContext(PresetCtx);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (delay: number, dur = 22, cfg: object = { damping: 200 }) =>
    spring({ frame: frame - delay, fps, config: cfg, durationInFrames: dur });

  return (
    <SceneBg>
      <BrandMin handle={props.handle} />

      {preset.cover === "amenaza" && (
        <div style={{ position: "absolute", left: MARGIN, top: 470, right: MARGIN }}>
          {props.amenaza.map((ln, i) => {
            const s = sp(i * 5);
            const pop = ln.hot ? sp(i * 5 + 2, 26, { damping: 12, stiffness: 140 }) : 1;
            const size = fit(ln.text, ln.hot ? 210 : 150);
            return (
              <div
                key={i}
                style={{
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [55, 0])}px) scale(${ln.hot ? interpolate(pop, [0, 1], [0.86, 1]) : 1})`,
                  transformOrigin: "left center",
                  color: ln.hot ? BRAND.yellow : BRAND.paper,
                  textShadow: ln.hot ? `0 0 ${interpolate(pop, [0, 1], [0, 40])}px rgba(255,196,0,0.55)` : "none",
                  fontSize: size,
                  lineHeight: 1.0,
                  marginBottom: 8,
                  whiteSpace: "nowrap",
                }}
              >
                {ln.text}
              </div>
            );
          })}
        </div>
      )}

      {preset.cover === "numero" && (
        <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 520, textAlign: "center" }}>
          <div style={{ opacity: sp(4), color: BRAND.muted, fontFamily: FONTS.mono, fontSize: 40, marginBottom: 30 }}>
            {props.numero.over}
          </div>
          <div
            style={{
              opacity: sp(8),
              transform: `scale(${interpolate(sp(8, 26, { damping: 12, stiffness: 130 }), [0, 1], [0.8, 1])})`,
              transformOrigin: "center center",
              color: BRAND.yellow,
              fontSize: fit(props.numero.num, 400),
              textShadow: `0 0 ${interpolate(sp(8), [0, 1], [0, 50])}px rgba(255,196,0,0.5)`,
              lineHeight: 1,
              marginBottom: 40,
            }}
          >
            {props.numero.num}
          </div>
          <div style={{ opacity: sp(18), color: BRAND.paper, fontSize: fit(props.numero.sub1, 150) }}>
            {props.numero.sub1}
          </div>
          <div style={{ opacity: sp(24), color: BRAND.muted, fontSize: fit(props.numero.sub2, 84), marginTop: 14 }}>
            {props.numero.sub2}
          </div>
        </div>
      )}

      {preset.cover === "pregunta" && (
        <>
          <div
            style={{
              position: "absolute",
              left: MARGIN,
              top: 430,
              opacity: sp(4),
              color: BRAND.paper,
              fontSize: fit(props.pregunta.top, 116),
            }}
          >
            {props.pregunta.top}
          </div>
          <div
            style={{
              position: "absolute",
              left: 1080 / 2 - 300,
              top: 660,
              width: 600,
              height: 600,
              borderRadius: "50%",
              border: `14px solid ${BRAND.yellow}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: sp(12),
              transform: `scale(${interpolate(sp(12, 28, { damping: 13 }), [0, 1], [0.6, 1])})`,
            }}
          >
            <span style={{ color: BRAND.yellow, fontSize: 220, lineHeight: 1 }}>{props.pregunta.ring}</span>
          </div>
          <div style={{ position: "absolute", left: MARGIN, top: 1360 }}>
            {props.pregunta.bottom.map((t, i) => (
              <div key={i} style={{ opacity: sp(22 + i * 4), color: BRAND.paper, fontSize: fit(t, 118), lineHeight: 1.02 }}>
                {t}
              </div>
            ))}
          </div>
        </>
      )}
    </SceneBg>
  );
};
