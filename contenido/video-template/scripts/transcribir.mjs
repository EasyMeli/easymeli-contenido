// Transcribe el audio de un video a subtítulos con tiempos por palabra
// (para los captions estilo TikTok). Usa whisper.cpp local (gratis).
//
//   node scripts/transcribir.mjs out/cupones-audio.wav guiones/cupones.captions.json
//
// La 1ª vez descarga whisper.cpp + el modelo (puede tardar varios minutos).
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const inputPath = process.argv[2] || "out/cupones-audio.wav";
const outPath = process.argv[3] || "guiones/cupones.captions.json";
const MODEL = process.argv.includes("--model") ? process.argv[process.argv.indexOf("--model") + 1] : "small";
const VERSION = "1.5.5";

const to = resolve("whisper.cpp");

console.log(`▶ Instalando whisper.cpp (v${VERSION})…`);
await installWhisperCpp({ to, version: VERSION });

console.log(`▶ Descargando modelo "${MODEL}"… (1ª vez tarda)`);
await downloadWhisperModel({ model: MODEL, folder: to });

console.log(`▶ Transcribiendo ${inputPath}…`);
const whisperOutput = await transcribe({
  inputPath: resolve(inputPath),
  whisperPath: to,
  whisperCppVersion: VERSION,
  model: MODEL,
  tokenLevelTimestamps: true,
  language: "es",
  printOutput: false,
});

const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

// Whisper parte algunas palabras en trozos (token-level). Los unimos: si un
// caption no empieza con espacio, es continuación de la palabra anterior.
const merged = [];
for (const x of captions) {
  if (merged.length && !/^\s/.test(x.text)) {
    const q = merged[merged.length - 1];
    q.text += x.text;
    q.endMs = x.endMs;
    q.timestampMs = Math.round((q.startMs + q.endMs) / 2);
  } else merged.push({ ...x });
}

mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(resolve(outPath), JSON.stringify(merged, null, 2));
console.log(`✓ ${captions.length} palabras → ${outPath}`);
console.log("   Ejemplo:", captions.slice(0, 6).map((c) => c.text).join(" ").trim());
