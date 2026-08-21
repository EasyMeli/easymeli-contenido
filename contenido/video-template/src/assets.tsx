import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

// Capa de asset traído de Canva (PNG transparente en public/canva/).
// Anima entrada (fade + escala) + flotación suave, para que el asset no
// quede muerto sobre el fondo. El texto se sigue animando por código
// encima: este es el híbrido Canva (visual) + Remotion (movimiento).
export const AssetLayer: React.FC<{
  src: string; // ruta relativa a public/, ej. "canva/caja.png"
  x: number;
  y: number;
  w: number;
  opacity?: number;
  delay?: number;
  floaty?: boolean; // flotación suave arriba/abajo
  parallax?: number; // px de deriva lenta (profundidad)
}> = ({ src, x, y, w, opacity = 1, delay = 0, floaty = true, parallax = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 20 });
  const bob = floaty ? Math.sin(frame / 22) * 10 : 0;
  const drift = parallax ? interpolate(frame, [0, 130], [0, parallax], { extrapolateRight: "clamp" }) : 0;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: x,
        top: y + bob + drift,
        width: w,
        opacity: opacity * s,
        transform: `scale(${interpolate(s, [0, 1], [0.92, 1])})`,
      }}
    />
  );
};
