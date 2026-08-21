// Validación del guion con zod. Un JSON mal armado (un campo que falta, un
// layout mal escrito, un número donde va texto) avisa con un mensaje claro
// EN vez de romper el render con un error críptico de React.
//
// Este archivo es la ÚNICA fuente de verdad: los tipos de guion.ts se
// infieren de acá, así el esquema y los tipos nunca se desincronizan.
import { z } from "zod";

// Un color de texto permitido.
export const textColor = z.enum(["yellow", "muted", "paper"]);

// Capa de asset opcional (PNG transparente en public/) sobre una escena.
export const assetData = z.object({
  src: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
});

// Un par [etiqueta, monto] de la tabla de desglose.
const par = z.tuple([z.string(), z.string()]);

// Cada escena declara su LAYOUT y los textos que lleva. La unión es
// "discriminada" por `layout`: zod sabe qué campos exigir según ese valor.
export const escenaData = z.discriminatedUnion("layout", [
  z.object({
    layout: z.literal("titulo-cuerpo"),
    kicker: z.string(),
    titulo: z.string(),
    cuerpo: z.string(),
    cuerpoColor: textColor.optional(),
    asset: assetData.optional(),
  }),
  z.object({
    layout: z.literal("titulo-regla-cuerpo"),
    kicker: z.string(),
    titulo: z.string(),
    cuerpo: z.string(),
    cuerpoColor: textColor.optional(),
  }),
  z.object({
    layout: z.literal("desglose"),
    kicker: z.string(),
    titulo: z.string(),
    filas: z.array(par).min(1),
    total: par,
    cuerpo: z.string().optional(),
    cuerpoColor: textColor.optional(),
  }),
  z.object({
    layout: z.literal("cierre"),
    kicker: z.string(),
    titulo: z.string(),
    titulo2: z.string(),
    tarea: z.string(),
  }),
  z.object({
    layout: z.literal("numero"),
    kicker: z.string(),
    label: z.string(),
    numero: z.string(),
    caption: z.string(),
  }),
  z.object({
    layout: z.literal("cita"),
    kicker: z.string(),
    texto: z.string(),
    autor: z.string(),
  }),
]);

// La portada trae el contenido de los 3 tipos; el preset decide cuál se ve.
export const portadaData = z.object({
  amenaza: z.array(z.object({ text: z.string(), hot: z.boolean().optional() })).min(1),
  numero: z.object({ over: z.string(), num: z.string(), sub1: z.string(), sub2: z.string() }),
  pregunta: z.object({ top: z.string(), ring: z.string(), bottom: z.array(z.string()).min(1) }),
});

// Clip INTRO generado por IA (Gemini): una imagen impactante del tema que abre
// el video con efectos (zoom/drift/light sweep) durante ~2s, y recién después
// entra la portada (el hook). `prompt` es el dato del que se genera la imagen;
// `archivo` es la ruta en public/ del PNG. Opcional: sin él, el video arranca
// directo en la portada.
// `persona: true` → el generador adjunta tus fotos de referencia (carpeta
// referencias/) para que el personaje de la escena tenga TU cara (consistencia
// de marca personal). Sin él, sale un personaje genérico.
export const introData = z.object({
  prompt: z.string(),
  archivo: z.string().optional(),
  persona: z.boolean().optional(),
});

// Texto para subir a TikTok (lo escribe la parte creativa/skill). El comando
// `producir` lo vuelca a un .txt, así se copia y pega sin recalcularlo.
export const publicacionData = z.object({
  descripcion: z.string(),
  hashtags: z.array(z.string()),
});

export const guionSchema = z.object({
  handle: z.string(),
  intro: introData.optional(),
  portada: portadaData,
  escenas: z.array(escenaData).min(1),
  publicacion: publicacionData.optional(),
});

// Layouts válidos, para el mensaje de ayuda cuando alguien escribe uno malo.
export const LAYOUTS = ["titulo-cuerpo", "titulo-regla-cuerpo", "desglose", "cierre", "numero", "cita"] as const;

// Traduce un tipo de zod al castellano, para el mensaje de error.
const TIPO: Record<string, string> = { string: "texto", number: "número", boolean: "sí/no (true/false)", array: "lista", object: "objeto" };

// Convierte un issue de zod en una frase clara en español.
function frase(i: z.core.$ZodIssue): string {
  const ruta = i.path.length ? i.path.join(" → ") : "(raíz)";
  if (i.code === "invalid_type") {
    const esp = TIPO[String(i.expected)] ?? String(i.expected);
    const falta = "input" in i && (i as { input?: unknown }).input === undefined;
    return falta ? `${ruta}: falta este campo (debe ser ${esp})` : `${ruta}: debe ser ${esp}`;
  }
  if (i.code === "invalid_union" || String(i.code).includes("discriminator")) {
    return `${ruta}: valor no reconocido. Usa uno de: ${LAYOUTS.join(", ")}`;
  }
  if (i.code === "invalid_value" || i.code === "invalid_enum" || String(i.code).includes("enum")) {
    return `${ruta}: valor no permitido (revisá layout o color)`;
  }
  if (i.code === "too_small") {
    return `${ruta}: no puede estar vacío`;
  }
  return `${ruta}: ${i.message}`;
}

// Valida un objeto cualquiera contra el esquema. Si falla, lanza un Error con
// un mensaje legible en español (ruta + qué está mal), no el volcado de zod.
// `nombre` es solo para el encabezado del mensaje (p. ej. el archivo).
export function parseGuion(data: unknown, nombre = "guion"): z.infer<typeof guionSchema> {
  const r = guionSchema.safeParse(data);
  if (r.success) return r.data;
  const lineas = r.error.issues.map((i) => `  • ${frase(i)}`);
  throw new Error(
    `El guion "${nombre}" tiene ${r.error.issues.length} error(es):\n${lineas.join("\n")}\n\n` +
      `Layouts válidos: ${LAYOUTS.join(", ")}. Colores válidos: yellow, muted, paper.`,
  );
}
