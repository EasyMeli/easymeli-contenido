import React, { useEffect, useState } from "react";
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { continueRender, delayRender, staticFile, cancelRender } from "remotion";

// Reproduce una animación Lottie (.json en public/lottie/) como capa.
// Íconos animados de calidad estudio. El .json puede venir de LottieFiles
// (gratis) o hecho a mano. Se usa igual que AssetLayer, pero animado solo.
export const LottieIcon: React.FC<{
  src: string; // ruta relativa a public/, ej. "lottie/ring.json"
  x: number;
  y: number;
  size: number;
}> = ({ src, x, y, size }) => {
  const [data, setData] = useState<LottieAnimationData | null>(null);
  const [handle] = useState(() => delayRender("cargando lottie"));

  useEffect(() => {
    fetch(staticFile(src))
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle, src]);

  if (!data) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size }}>
      <Lottie animationData={data} loop />
    </div>
  );
};
