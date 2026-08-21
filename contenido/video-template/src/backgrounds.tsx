import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { BRAND } from "./brand";

// Fondo AURORA: manchas de luz de marca que derivan lento con ruido Perlin.
// Da vida al fondo (no queda plano) sin competir con el texto: está muy
// difuminado y a baja opacidad. Usa @remotion/noise.
export const AuroraBg: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 110; // deriva lenta

  // Cada mancha: posición en % que oscila con ruido, color de marca tenue.
  const blob = (seed: string, color: string, size: number, phase: number) => {
    const x = 50 + noise2D(seed + "x", t + phase, 0) * 34;
    const y = 46 + noise2D(seed + "y", 0, t + phase) * 30;
    return `radial-gradient(${size}% ${size}% at ${x}% ${y}%, ${color} 0%, transparent 55%)`;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.ink }}>
      <AbsoluteFill
        style={{
          backgroundImage: [
            blob("a", "rgba(30,86,232,0.30)", 70, 0), // azul de marca
            blob("b", "rgba(255,196,0,0.10)", 55, 3.1), // pizca de amarillo
            blob("c", "rgba(20,60,150,0.28)", 80, 6.2), // azul profundo
          ].join(","),
          filter: "blur(60px)",
        }}
      />
    </AbsoluteFill>
  );
};
