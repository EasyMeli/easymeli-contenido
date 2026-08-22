// UN comando para el VIDEO HABLADO (tu footage editado), sin gastar tokens de
// Claude. Lee TODO desde la carpeta del tema (temas/<tema>/): el guion, uno o
// varios clips en grabaciones/, y la captura del cierre en capturas/. Une los
// clips con transiciones pro, saca la duración, genera la intro (si falta),
// extrae el audio, transcribe (whisper) y renderiza el video.
//
//   1) Grabas 1 o varios clips y los dejas en  temas/<tema>/grabaciones/
//   2) node scripts/producir-hablado.mjs <tema>        (ej: cupones)
//
// Flags: --sin-imagen (no toca Gemini)  ·  --re-subs (rehace la transcripción)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { resolverTema, clipsDeTema } from "./lib-tema.mjs";
import { combinarClips, duracionSeg } from "./lib-video.mjs";

const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const die = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };

let tema;
try { tema = resolverTema(args.find((a) => !a.startsWith("--"))); }
catch (e) { die(e.message); }
const { guionPath, temaDir, nombre, grabacionesDir, capturasDir, captionsPath, outDir } = tema;
const guion = JSON.parse(readFileSync(guionPath, "utf8"));

const run = (label, cmd, a) => {
  console.log(`\n━━━ ${label} ━━━`);
  const r = spawnSync(cmd, a, { stdio: "inherit", cwd: resolve(".") });
  if (r.status !== 0) die(`Falló: ${label}`);
};

// 1) Clips del tema → combinarlos (con transiciones si hay varios) a public/
const clips = clipsDeTema(grabacionesDir);
if (clips.length === 0) die(`No hay grabaciones en ${grabacionesDir}/ (deja ahí tu clip como 1.mp4).`);
mkdirSync(resolve("public/grabaciones"), { recursive: true });
const pub = resolve("public/grabaciones", `${nombre}.mp4`);
console.log(`▶ ${clips.length} clip(s) en ${grabacionesDir}/`);
try { combinarClips(clips.map((c) => resolve(c)), pub); } catch (e) { die(e.message); }

// 2) Duración del footage combinado → frames (30fps)
const footageFrames = Math.round(duracionSeg(pub) * 30);
console.log(`▶ Footage final: ${duracionSeg(pub).toFixed(1)}s → ${footageFrames} frames`);

// 3) Intro con tu cara (solo si el guion lo pide y falta el PNG)
let introArchivo = "";
if (guion.intro?.prompt && !has("--sin-imagen")) {
  const rel = guion.intro.archivo || `ai/${nombre}-intro.png`;
  if (!existsSync(resolve("public", rel))) run("Intro (Gemini ~US$0,04)", "node", ["scripts/generar-imagen.mjs", guionPath]);
  if (existsSync(resolve("public", rel))) introArchivo = rel;
}

// 3.5) Objetos 3D del TEMA (si el guion los declara en `objetos`). Pack propio,
//      con la clave de la persona. Se saltan los que ya existen (no regasta).
if (guion.objetos && Object.keys(guion.objetos).length && !has("--sin-imagen")) {
  run("Objetos del tema (Gemini)", "node", ["scripts/generar-objetos.mjs", "--guion", guionPath]);
}

// 4) Audio → out/<tema>/
mkdirSync(resolve(outDir), { recursive: true });
const audio = `${outDir}/audio.wav`;
if (!existsSync(resolve(audio))) run("Extraer audio", "npx", ["remotion", "ffmpeg", "-y", "-i", pub, "-vn", "-ac", "1", "-ar", "16000", audio]);

// 5) Subtítulos (whisper) → temas/<tema>/<tema>.captions.json (editable)
if (!existsSync(resolve(captionsPath)) || has("--re-subs")) run("Transcribir (whisper, gratis)", "node", ["scripts/transcribir.mjs", audio, captionsPath]);
mkdirSync(resolve("public/captions"), { recursive: true });
copyFileSync(resolve(captionsPath), resolve("public/captions", `${nombre}.json`));

// 6) Captura del cierre (opcional): primera imagen de temas/<tema>/capturas/
let capturaArchivo = "";
if (existsSync(capturasDir)) {
  const img = readdirSync(capturasDir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()[0];
  if (img) {
    mkdirSync(resolve("public/capturas"), { recursive: true });
    const capRel = `capturas/${nombre}.png`;
    copyFileSync(resolve(join(capturasDir, img)), resolve("public", capRel));
    capturaArchivo = capRel;
    console.log(`▶ CTA con captura: ${join(capturasDir, img)}`);
  }
}

// 7) Render del video hablado
const DEFAULT_TEXTOS = {
  tituloArriba: "VENDES EN MERCADOLIBRE", tituloAbajo: "Y TU MARGEN NO CIERRA",
  placa: "-20%", alturaSubtitulos: 300, tamanoLetra: 60,
  estiloSubtitulos: "limpio", estiloCamara: "auto",
};
const textos = { ...DEFAULT_TEXTOS, ...(guion.video || {}) };
const capturaTargetX = guion.video?.capturaTargetX ?? 0.5;
const capturaTargetY = guion.video?.capturaTargetY ?? 0.42;

// Objetos del tema: el guion puede traer `reglas` [{palabras, objeto, label}] para
// que aparezcan objetos propios del tema, además de los genéricos de marca.
const reglasExtra = JSON.stringify(guion.reglas || []);

const propsPath = resolve(`${outDir}/.props-hablado.json`);
writeFileSync(propsPath, JSON.stringify({ footage: `grabaciones/${nombre}.mp4`, footageFrames, introArchivo, captionsFile: `captions/${nombre}.json`, textos, capturaArchivo, capturaTargetX, capturaTargetY, reglasExtra }));
const out = `${outDir}/${nombre}-hablado.mp4`;
run(`Render video (${introArchivo ? "con intro" : "sin intro"})`, "npx", ["remotion", "render", "VideoHablado", out, "--props", propsPath]);

console.log(`\n✅ Listo: ${out}`);
console.log(`   Subtítulos editables en ${captionsPath} (corrige lo que whisper escuche mal y re-renderiza).`);
