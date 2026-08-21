// Esquema del "guion" de un video: el contenido vive en un JSON (guiones/),
// no en el código. Para un video nuevo, se copia un .json y se cambian los
// textos — sin tocar componentes. El preset (look) se elige aparte, así el
// mismo guion se puede renderizar en los 4 estilos.
//
// Los tipos se infieren del esquema zod (guionSchema.ts) para que validación
// y tipos nunca se desincronicen. Acá solo se re-exportan + palabrasEscena.
import type { z } from "zod";
import type { textColor, assetData, escenaData, portadaData, guionSchema } from "./guionSchema";

export type TextColor = z.infer<typeof textColor>;
export type AssetData = z.infer<typeof assetData>;
export type EscenaData = z.infer<typeof escenaData>;
export type PortadaData = z.infer<typeof portadaData>;
export type Guion = z.infer<typeof guionSchema>;

export { parseGuion } from "./guionSchema";

// Cuenta las palabras de una escena (para calcular su duración por lectura).
export const palabrasEscena = (e: EscenaData): number => {
  const t = (s?: string) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
  switch (e.layout) {
    case "titulo-cuerpo":
    case "titulo-regla-cuerpo":
      return t(e.titulo) + t(e.cuerpo);
    case "desglose":
      return t(e.titulo) + e.filas.length * 2 + 2 + t(e.cuerpo);
    case "cierre":
      return t(e.titulo) + t(e.titulo2) + t(e.tarea);
    case "numero":
      return t(e.label) + 1 + t(e.caption);
    case "cita":
      return t(e.texto) + t(e.autor);
  }
};
