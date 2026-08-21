// UN comando que deja TODO listo para publicar, a partir de tu grabación + el
// guion. Hace: video hablado (tu footage editado con subtítulos + animaciones)
// + corto de 10s + carrusel + post de Skool + descripción de TikTok.
// Cero tokens de Claude.
//
//   1) Grabás y guardás en  grabaciones/<tema>.mp4
//   2) node scripts/todo.mjs guiones/<tema>.json
//
// Flags: se pasan a producir-hablado (--sin-imagen, --re-subs).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolverTema } from "./lib-tema.mjs";

const SKILL = process.env.CONTENIDO_SKILL || `${process.env.HOME}/.claude/skills/contenido`;
const args = process.argv.slice(2);
const extra = args.filter((a) => a.startsWith("--"));
let tema;
try { tema = resolverTema(args.find((a) => !a.startsWith("--"))); }
catch (e) { console.error(`\n✖ ${e.message}\n\nUso: npm run todo -- <tema>   (ej: cupones)\n`); process.exit(1); }
const { guionPath, nombre, outDir } = tema;
const guion = JSON.parse(readFileSync(guionPath, "utf8"));

// Cada tema tiene SU carpeta: out/<tema>/ (así no se mezcla ni se pisa nada).
mkdirSync(resolve(outDir), { recursive: true });

const pasos = [];
const run = (label, cmd, a, extraEnv) => {
  console.log(`\n═══ ${label} ═══`);
  const r = spawnSync(cmd, a, { stdio: "inherit", cwd: resolve("."), env: extraEnv ? { ...process.env, ...extraEnv } : process.env });
  pasos.push({ label, ok: r.status === 0 });
  return r.status === 0;
};

// 1) Video hablado (footage + intro + subtítulos + animaciones). Hace también
//    imagen, audio, transcripción y copia de subtítulos. Escribe en out/<tema>/.
run("Video hablado", "node", ["scripts/producir-hablado.mjs", guionPath, ...extra]);

// 2) Corto de ~10s (mismo footage recortado, sin intro)
const propsCorto = resolve(`${outDir}/.props-corto.json`);
writeFileSync(propsCorto, JSON.stringify({ footage: `grabaciones/${nombre}.mp4`, footageFrames: 210, introArchivo: "", captionsFile: `captions/${nombre}.json` }));
run("Corto 10s", "npx", ["remotion", "render", "VideoHablado", `${outDir}/${nombre}-corto.mp4`, "--props", propsCorto]);

// 2.5) Rostro para el carrusel (portada + cierre con TU cara, vía Gemini).
//      Se salta solo si ya existen (no regasta tokens). Requiere referencias/.
if (existsSync(resolve("referencias"))) {
  run("Rostro carrusel", "node", ["scripts/carrusel-rostro.mjs", guionPath]);
}

// 3) Carrusel (marca) — usa el rostro si está, si no cae al navy editorial.
//    CARRUSEL_OUT le dice al script Python que guarde en la carpeta del tema.
run("Carrusel", "python3", [`${SKILL}/scripts/generar_carrusel.py`, guionPath], { CARRUSEL_OUT: `${outDir}/` });

// 4) Post de Skool
run("Post de Skool", "python3", [`${SKILL}/scripts/post_skool.py`, guionPath, "--out", `${outDir}/${nombre}-skool.md`]);

// 4.5) Teleprompter (lo que decís a cámara, ~20-30s)
run("Teleprompter", "python3", [`${SKILL}/scripts/teleprompter.py`, guionPath, "--out", `${outDir}/${nombre}-teleprompter.md`]);

// 5) Descripción + hashtags de TikTok
if (guion.publicacion) {
  const tags = (guion.publicacion.hashtags || []).map((t) => `#${t}`).join(" ");
  writeFileSync(`${outDir}/${nombre}-tiktok.txt`, `${guion.publicacion.descripcion}\n\n${tags}\n`);
  pasos.push({ label: "Descripción TikTok", ok: true });
}

console.log(`\n\n═══ RESUMEN "${nombre}" ═══`);
for (const p of pasos) console.log(`  ${p.ok ? "✓" : "✗"} ${p.label}`);
console.log(`\nTodo en la carpeta  ${outDir}/  →  ${nombre}-hablado.mp4 · ${nombre}-corto.mp4 · 01…06-*.png · ${nombre}-skool.md · ${nombre}-teleprompter.md · ${nombre}-tiktok.txt`);
console.log(pasos.every((p) => p.ok) ? "\n✅ TODO listo para subir." : "\n⚠ Revisá los pasos con ✗.");
