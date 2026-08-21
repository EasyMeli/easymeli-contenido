import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { BRAND, FONTS } from "./brand";

// Clip INTRO: la imagen IA del tema abre el video con efectos cinematográficos
// durante ~2s, y después entra la portada (el hook). Efectos: zoom lento (Ken
// Burns) + drift, barrido de luz, viñeta y scrim navy abajo para que empalme
// con la marca. La imagen se genera con scripts/generar-imagen.mjs.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Intro: React.FC<{ archivo: string; dur: number }> = ({ archivo, dur }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, dur], [1.08, 1.24], clamp);
  const driftX = interpolate(frame, [0, dur], [0, -34], clamp);
  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  // barrido de luz que cruza una vez
  const sweepX = interpolate(frame, [0, dur], [-60, 160], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: fadeIn, transform: `scale(${scale}) translateX(${driftX}px)`, transformOrigin: "58% 45%" }}>
        <Img src={staticFile(archivo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>

      {/* barrido de luz (una pasada), suma brillo sin tapar */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweepX - 22}%, rgba(255,255,255,0.14) ${sweepX}%, transparent ${sweepX + 22}%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* viñeta cinematográfica: oscurece bordes, enfoca el centro */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 55% 42%, transparent 40%, rgba(4,10,24,0.72) 100%)" }} />
      {/* scrim navy abajo: empalma con la portada (que es navy) */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(6,12,26,0.96) 0%, rgba(6,12,26,0.30) 26%, transparent 55%)" }} />

      {/* marca mínima abajo, para que el intro ya sea Easy Meli */}
      <div style={{ position: "absolute", left: 112, bottom: 120, display: "flex", alignItems: "center", gap: 18, opacity: interpolate(frame, [8, 24], [0, 1], clamp) }}>
        <Img src={staticFile("logo.png")} style={{ width: 72, height: 72 }} />
        <span style={{ color: BRAND.paper, fontFamily: FONTS.display, fontSize: 40, letterSpacing: 1 }}>EASY MELI</span>
      </div>
    </AbsoluteFill>
  );
};
