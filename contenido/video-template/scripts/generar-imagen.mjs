// Genera la imagen del clip INTRO de un guion con la API de Gemini (Google AI
// Studio) y la guarda en public/, lista para que Remotion la anime al inicio.
//
//   export GEMINI_API_KEY="tu-clave-de-ai-studio"   (una vez, en tu terminal)
//   node scripts/generar-imagen.mjs guiones/cupones.json
//   node scripts/generar-imagen.mjs guiones/cupones.json --model gemini-2.5-flash-image
//
// Lee `intro.prompt` del guion, llama al modelo de imagen, y escribe el PNG en
// public/<intro.archivo> (default: ai/<nombre>-intro.png). Si el guion no traía
// `archivo`, se lo agrega y guarda. La clave se lee del entorno: nunca se
// hardcodea ni se pide por pantalla.
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { basename, resolve, dirname, join } from "node:path";

const MODEL_DEFAULT = "gemini-2.5-flash-image"; // "Nano Banana"

// Carga .env (simple, sin dependencias): una línea CLAVE=valor. No pisa lo que
// ya venga del entorno (así `export GEMINI_API_KEY=...` sigue teniendo prioridad).
const envPath = resolve(".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

const args = process.argv.slice(2);
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const guionPath = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--model");

const die = (m) => {
  console.error(`\n✖ ${m}\n`);
  process.exit(1);
};

if (!guionPath) die("Uso: node scripts/generar-imagen.mjs <guion.json> [--model <modelo>]");
if (!existsSync(guionPath)) die(`No existe el archivo: ${guionPath}`);

const key = process.env.GEMINI_API_KEY;
if (!key) {
  die(
    "Falta la clave GEMINI_API_KEY. Pégala en el archivo .env:\n" +
      "    GEMINI_API_KEY=tu-clave-de-ai-studio\n" +
      "  (o exportala: export GEMINI_API_KEY=\"...\")\n" +
      "  La sacas de https://aistudio.google.com/apikey (con facturación habilitada para imágenes)."
  );
}

const guion = JSON.parse(readFileSync(guionPath, "utf8"));
const arte = guion?.intro;
if (!arte?.prompt) {
  die(`El guion no tiene intro.prompt. Agrega el prompt de la imagen en ${basename(guionPath)}.`);
}

const nombre = basename(guionPath).replace(/\.json$/i, "");
const rel = arte.archivo || `ai/${nombre}-intro.png`;
const dest = resolve(join("public", rel));
mkdirSync(dirname(dest), { recursive: true });

const model = flag("--model") || MODEL_DEFAULT;
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

// Fotos de referencia del usuario (carpeta referencias/). Si el intro pide
// `persona: true`, se adjuntan para que el personaje tenga SU cara (consistencia
// de marca). Se toman hasta 5, ordenadas.
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const refParts = () => {
  const dir = resolve("referencias");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().slice(0, 5);
  return files.map((f) => ({
    inlineData: { mimeType: MIME[f.split(".").pop().toLowerCase()], data: readFileSync(join(dir, f)).toString("base64") },
  }));
};

// Arma las partes del pedido: (fotos de referencia) + texto del prompt.
let promptText = arte.prompt;
const parts0 = [];
if (arte.persona) {
  const refs = refParts();
  if (refs.length === 0) {
    console.warn("⚠ intro.persona = true pero no hay fotos en referencias/. Se genera personaje genérico.");
  } else {
    parts0.push(...refs);
    promptText =
      "IMPORTANTE: la persona que aparece en la escena debe ser EXACTAMENTE la misma persona de las imágenes de referencia adjuntas — misma cara, mismos rasgos faciales, misma identidad, look consistente. " +
      promptText;
    console.log(`  (usando ${refs.length} foto(s) de referencia para tu cara)`);
  }
}
parts0.push({ text: promptText });

console.log(`▶ Generando imagen de "${nombre}" con ${model}…`);

// aspectRatio 9:16 en el PARÁMETRO (no solo en el prompt): así el modelo genera
// vertical de una y el objectFit:cover de Remotion casi no recorta. Evita
// regenerar por una imagen cuadrada mal encuadrada (eso sí gastaría de más).
const resp = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: parts0 }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "9:16" },
    },
  }),
});

if (!resp.ok) {
  const t = await resp.text();
  die(`La API respondió ${resp.status}. Revisa clave/cuota/modelo.\n${t.slice(0, 400)}`);
}

const data = await resp.json();
const parts = data?.candidates?.[0]?.content?.parts ?? [];
const img = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
const b64 = img?.inlineData?.data || img?.inline_data?.data;
if (!b64) {
  const txt = parts.map((p) => p.text).filter(Boolean).join(" ");
  die(`El modelo no devolvió imagen.${txt ? ` Dijo: ${txt.slice(0, 200)}` : " Prueba otro modelo con --model."}`);
}

writeFileSync(dest, Buffer.from(b64, "base64"));

// Persistir la ruta en el guion si no la tenía (para que la intro la use).
if (!arte.archivo) {
  guion.intro.archivo = rel;
  writeFileSync(guionPath, JSON.stringify(guion, null, 2) + "\n");
}

console.log(`✓ Imagen guardada: public/${rel}`);
console.log(`  Ahora renderiza: node scripts/nuevo-video.mjs ${guionPath}`);
