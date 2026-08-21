import React from "react";
import { BRAND } from "./brand";

// Biblioteca de ÍCONOS/OBJETOS de marca (vectoriales) para las animaciones.
// Se usan como "callouts" relacionados con lo que se habla (no solo texto).
// Todos en amarillo de marca, trazo grueso, estilo limpio.
const Y = BRAND.yellow;
const S: React.SVGProps<SVGSVGElement> = { fill: "none", stroke: Y, strokeWidth: 7, strokeLinecap: "round", strokeLinejoin: "round" };

const Svg: React.FC<{ children: React.ReactNode; s: number }> = ({ children, s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" {...S}>{children}</svg>
);

export const ICONOS: Record<string, (s: number) => React.ReactNode> = {
  // cupón / ticket
  cupon: (s) => (
    <Svg s={s}><path d="M12 30h76v14a6 6 0 000 12v14H12V56a6 6 0 000-12z" /><path d="M50 26v6M50 46v8M50 68v6" /></Svg>
  ),
  // etiqueta / promoción
  etiqueta: (s) => (
    <Svg s={s}><path d="M52 12H88v36L52 84 16 48z" /><circle cx={74} cy={26} r={6} /></Svg>
  ),
  // billetes / plata
  billete: (s) => (
    <Svg s={s}><rect x={14} y={30} width={72} height={40} rx={6} /><circle cx={50} cy={50} r={10} /><path d="M26 40v20M74 40v20" /></Svg>
  ),
  // camión / envío
  camion: (s) => (
    <Svg s={s}><path d="M10 30h44v34H10zM54 42h20l12 12v10H54z" /><circle cx={28} cy={72} r={7} /><circle cx={70} cy={72} r={7} /></Svg>
  ),
  // gráfico que baja / pérdida
  grafico: (s) => (
    <Svg s={s}><path d="M16 20v64h68" /><path d="M28 40l16 14 12-8 20 18" /><path d="M76 50v14H62" /></Svg>
  ),
  // estrella / reputación
  estrella: (s) => (
    <Svg s={s}><path d="M50 14l11 22 24 3-17 17 4 24-22-12-22 12 4-24-17-17 24-3z" /></Svg>
  ),
  // escudo / marca-INAPI
  escudo: (s) => (
    <Svg s={s}><path d="M50 12l30 10v22c0 20-14 34-30 42-16-8-30-22-30-42V22z" /><path d="M38 48l9 9 16-18" /></Svg>
  ),
  // alerta
  alerta: (s) => (
    <Svg s={s}><path d="M50 16l38 66H12z" /><path d="M50 40v20M50 70v.5" /></Svg>
  ),
  // caja / catálogo
  caja: (s) => (
    <Svg s={s}><path d="M50 12l34 18v40L50 88 16 70V30z" /><path d="M16 30l34 18 34-18M50 48v40" /></Svg>
  ),
  // carrito
  carrito: (s) => (
    <Svg s={s}><path d="M14 18h12l10 44h40l10-30H30" /><circle cx={42} cy={78} r={6} /><circle cx={74} cy={78} r={6} /></Svg>
  ),
  // flecha hacia arriba (link en perfil)
  flecha: (s) => (
    <Svg s={s}><path d="M50 84V22M28 44L50 20l22 24" /></Svg>
  ),
};

export type IconoNombre = keyof typeof ICONOS;
