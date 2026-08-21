// Plan B de transcripción: usa Gemini (que tiene internet estable acá) en vez
// de whisper.cpp (cuyo modelo se baja de HuggingFace y a veces falla).
// Manda el audio y pide las palabras con tiempos, y las guarda en el formato
// de captions que usa src/Subtitulos.tsx.
//
//   node scripts/transcribir-gemini.mjs out/cupones-audio.wav guiones/cupones.captions.json
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// cargar .env
const envPath = resolve(".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
}
const key = process.env.GEMINI_API_KEY;
if (!key) { console.error("Falta GEMINI_API_KEY en .env"); process.exit(1); }

const inputPath = process.argv[2] || "out/cupones-audio.wav";
const outPath = process.argv[3] || "guiones/cupones.captions.json";
const b64 = readFileSync(resolve(inputPath)).toString("base64");

const prompt =
  "Transcribí este audio en español (Chile). Devolvé SOLO un JSON array, sin texto " +
  "adicional ni markdown, de objetos {\"w\": palabra, \"s\": segundo_inicio, \"e\": segundo_fin}. " +
  "Una entrada por palabra, en orden, con s y e como números en segundos (decimales). " +
  "No agregues comentarios.";

const model = "gemini-2.5-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

console.log("▶ Transcribiendo con Gemini…");
const resp = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ inlineData: { mimeType: "audio/wav", data: b64 } }, { text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0 },
  }),
});
if (!resp.ok) { console.error("API", resp.status, (await resp.text()).slice(0, 400)); process.exit(1); }

const data = await resp.json();
let txt = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("") || "";
txt = txt.trim().replace(/^```json\s*|\s*```$/g, "");
let words;
try { words = JSON.parse(txt); } catch { console.error("No pude parsear JSON:", txt.slice(0, 300)); process.exit(1); }

const captions = words
  .filter((x) => x && x.w != null && x.s != null && x.e != null)
  .map((x) => ({
    text: " " + String(x.w).trim(),
    startMs: Math.round(Number(x.s) * 1000),
    endMs: Math.round(Number(x.e) * 1000),
    timestampMs: Math.round(((Number(x.s) + Number(x.e)) / 2) * 1000),
    confidence: 1,
  }));

mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(resolve(outPath), JSON.stringify(captions, null, 2));
console.log(`✓ ${captions.length} palabras → ${outPath}`);
console.log("   texto:", captions.map((c) => c.text).join("").trim().slice(0, 300));
