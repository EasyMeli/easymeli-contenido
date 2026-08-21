import React from "react";
import { BRAND } from "./brand";

// --- Sistema de presets -------------------------------------------------
// La MARCA es constante (navy + logo + amarillo + tipografías). Lo que
// rota entre videos es la ESTRUCTURA: portada, transiciones, motion y
// textura de fondo. Regla: nunca dos videos seguidos con el mismo preset.

export type Motion = "rise" | "scale" | "blur";
export type Texture = "vignette" | "grid" | "diagonal" | "dots" | "aurora";
export type TransPack = "slide" | "wipe" | "mix";
export type CoverStyle = "amenaza" | "numero" | "pregunta";

export type Preset = {
  name: string;
  cover: CoverStyle;
  motion: Motion;
  texture: Texture;
  transPack: TransPack;
};

export const PRESETS: Record<string, Preset> = {
  amenaza: { name: "amenaza-dinamica", cover: "amenaza", motion: "rise", texture: "vignette", transPack: "slide" },
  numero: { name: "numero-editorial", cover: "numero", motion: "scale", texture: "grid", transPack: "wipe" },
  split: { name: "comparacion-split", cover: "pregunta", motion: "blur", texture: "diagonal", transPack: "mix" },
  aurora: { name: "flujo-aurora", cover: "amenaza", motion: "scale", texture: "aurora", transPack: "mix" },
};

export const PresetCtx = React.createContext<Preset>(PRESETS.amenaza);

// rgba de la línea de marca a distintas opacidades (para las texturas).
const line = (a: number) => `rgba(33,56,107,${a})`;

// Devuelve el estilo de fondo (base navy + textura) para un preset.
export const textureStyle = (texture: Texture): React.CSSProperties => {
  const base: React.CSSProperties = { backgroundColor: BRAND.ink };
  switch (texture) {
    case "grid":
      return {
        ...base,
        backgroundImage: `linear-gradient(${line(0.16)} 2px, transparent 2px), linear-gradient(90deg, ${line(0.16)} 2px, transparent 2px)`,
        backgroundSize: "92px 92px, 92px 92px",
      };
    case "diagonal":
      return {
        ...base,
        backgroundImage: `repeating-linear-gradient(45deg, ${line(0.14)} 0 3px, transparent 3px 44px)`,
      };
    case "dots":
      return {
        ...base,
        backgroundImage: `radial-gradient(${line(0.24)} 4px, transparent 4px)`,
        backgroundSize: "52px 52px",
      };
    case "vignette":
    default:
      return { background: `radial-gradient(120% 90% at 50% 38%, ${BRAND.inkHi} 0%, ${BRAND.ink} 60%)` };
  }
};
