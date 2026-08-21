import React, { useContext } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { measureText } from "@remotion/layout-utils";
import { BRAND, FONTS } from "./brand";
import { loadFonts } from "./fonts";
import { PresetCtx, textureStyle, Motion } from "./presets";
import { AuroraBg } from "./backgrounds";

loadFonts();

// --- Zona segura de TikTok --------------------------------------------
// TikTok tapa los bordes: botones a la derecha, usuario/descripción/sonido
// abajo, y el marco del celular recorta los lados. Todo el contenido vive
// dentro de estos márgenes para que se lea cómodo y no quede tapado.
export const MARGIN = 112; // margen lateral seguro (antes 86 = muy justo)
export const TOP = 300; // arranque del contenido (debajo del header)
export const BOTTOM = 340; // reserva inferior (descripción/usuario de TikTok)
export const SAFE_W = 1080 - MARGIN * 2; // 856
// Ancho OBJETIVO para ajustar texto: el margen seguro menos un respiro de 22px
// por lado, para que el texto nunca quede pegado a la línea del margen (se ve
// más cómodo y centrado, y perdona pequeños errores de medición).
export const COMFORT = 22;
export const FIT_W = SAFE_W - COMFORT * 2; // 812

export const fitSize = (text: string, base: number, em = 0.72) =>
  Math.min(base, Math.floor(SAFE_W / (Math.max(text.length, 1) * em)));

// Ajuste EXACTO con @remotion/layout-utils: mide el ancho real de cada
// palabra con la fuente y el cuerpo dados, y baja el cuerpo hasta que la
// palabra más ancha entra en el margen seguro. Reemplaza la estimación:
// garantiza que NINGUNA página choque con los bordes.
export const fitWidth = (
  text: string,
  fontFamily: string,
  base: number,
  maxW: number = FIT_W,
  min = 30
) => {
  let size = base;
  const words = text.split(/\s+/).filter(Boolean);
  for (const w of words) {
    let guard = 0;
    while (size > min && guard < 300) {
      const { width } = measureText({ text: w, fontFamily, fontSize: size, fontWeight: "400" });
      if (width <= maxW) break;
      size -= 2;
      guard++;
    }
  }
  return size;
};

// Como fitWidth pero mide la LÍNEA COMPLETA (para textos de una sola línea
// sin wrap, como la portada): baja el cuerpo hasta que toda la línea entra
// en el margen seguro. Evita que "UN 20%" o "Y NO LO" pasen el borde.
export const fitLine = (
  text: string,
  fontFamily: string,
  base: number,
  maxW: number = FIT_W,
  min = 30
) => {
  let size = base;
  let guard = 0;
  while (size > min && guard < 400) {
    const { width } = measureText({ text, fontFamily, fontSize: size, fontWeight: "400" });
    if (width <= maxW) break;
    size -= 2;
    guard++;
  }
  return size;
};

// Estimación heurística (respaldo, sin medición). Preferí fitWidth.
export const titleSize = (text: string, base: number, em = 0.62) => {
  const longest = text.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), "");
  return Math.min(base, Math.floor(SAFE_W / (Math.max(longest.length, 1) * em)));
};

// Estilo de entrada según el motion del preset (0..1 = progreso del spring).
export const motionStyle = (motion: Motion, s: number, dy: number): React.CSSProperties => {
  if (motion === "scale")
    return { opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`, transformOrigin: "left center" };
  if (motion === "blur")
    return { opacity: s, filter: `blur(${interpolate(s, [0, 1], [14, 0])}px)` };
  return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [dy, 0])}px)` }; // rise
};

// Fondo navy + textura del preset + profundidad + marca de agua, con un
// zoom lento (Ken Burns) que mantiene la escena viva.
export const SceneBg: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const preset = useContext(PresetCtx);
  const zoom = interpolate(frame, [0, 130], [1.0, 1.045], { extrapolateRight: "clamp" });
  const isAurora = preset.texture === "aurora";
  return (
    <AbsoluteFill
      style={{ ...(isAurora ? { backgroundColor: BRAND.ink } : textureStyle(preset.texture)), fontFamily: FONTS.display }}
    >
      {/* fondo animado (no queda plano) cuando el preset lo pide */}
      {isAurora && <AuroraBg />}
      {/* profundidad: oscurece los bordes para que la textura no aplane */}
      <AbsoluteFill
        style={{ background: "radial-gradient(130% 100% at 50% 38%, transparent 42%, rgba(4,10,24,0.55) 100%)" }}
      />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 42%" }}>
        <Img
          src={staticFile("logo.png")}
          style={{ position: "absolute", width: 780, left: (1080 - 780) / 2, top: 640, opacity: 0.05 }}
        />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Zona de contenido entre el header y el footer. Reparte los hijos en
// columna con un gap garantizado: nada choca aunque el texto crezca.
export const Stage: React.FC<{
  children: React.ReactNode;
  gap?: number;
  justify?: "center" | "flex-start";
}> = ({ children, gap = 46, justify = "center" }) => (
  <div
    style={{
      position: "absolute",
      left: MARGIN,
      right: MARGIN,
      top: TOP,
      bottom: BOTTOM,
      display: "flex",
      flexDirection: "column",
      justifyContent: justify,
      gap,
    }}
  >
    {children}
  </div>
);

// Header de marca (slides internas).
export const Header: React.FC<{ kicker: string; n: number; total?: number }> = ({
  kicker,
  n,
  total = 6,
}) => (
  <>
    <div style={{ position: "absolute", left: MARGIN, top: 110, display: "flex", alignItems: "center", gap: 20 }}>
      <Img src={staticFile("logo.png")} style={{ width: 132, height: 132 }} />
      <div style={{ lineHeight: 1.02 }}>
        <div style={{ color: BRAND.paper, fontSize: 44 }}>EASY</div>
        <div style={{ color: BRAND.yellow, fontSize: 44 }}>MELI</div>
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        right: MARGIN,
        top: 128,
        background: BRAND.yellow,
        color: BRAND.ink,
        fontFamily: FONTS.mono,
        fontSize: 30,
        padding: "12px 20px",
        borderRadius: 8,
      }}
    >
      {kicker}
    </div>
    <div
      style={{ position: "absolute", right: MARGIN, top: 204, color: BRAND.muted, fontFamily: FONTS.mono, fontSize: 28 }}
    >
      {String(n).padStart(2, "0")}/{String(total).padStart(2, "0")}
    </div>
  </>
);

export const Footer: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 1690, height: 2, background: BRAND.line }} />
    <div style={{ position: "absolute", left: MARGIN, top: 1708, display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={staticFile("logo.png")} style={{ width: 54, height: 54 }} />
      <span style={{ color: BRAND.muted, fontFamily: FONTS.mono, fontSize: 26 }}>skool.com/easymeli</span>
    </div>
  </>
);

// Entrada escalonada. El estilo lo decide el motion del preset.
export const Reveal: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dy?: number;
}> = ({ delay = 0, children, style, dy = 50 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preset = useContext(PresetCtx);
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 22 });
  return <div style={{ ...style, ...motionStyle(preset.motion, s, dy) }}>{children}</div>;
};
