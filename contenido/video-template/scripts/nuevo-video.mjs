// Renderiza un video desde un guion (JSON), sin tocar código.
//
//   node scripts/nuevo-video.mjs guiones/mi-tema.json
//   node scripts/nuevo-video.mjs guiones/mi-tema.json --preset numero
//   node scripts/nuevo-video.mjs guiones/mi-tema.json --out out/mi-tema.mp4
//   node scripts/nuevo-video.mjs guiones/mi-tema.json --corto   (corto ~10s)
//   node scripts/nuevo-video.mjs guiones/mi-tema.json --check   (solo valida)
//
// Primero valida el guion (mismo esquema zod de src/guionSchema.ts, compilado
// al vuelo con esbuild). Si algo está mal, corta con un mensaje claro en
// español ANTES de gastar tiempo abriendo Remotion. Recién si pasa, renderiza.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { basename, resolve, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";

// Presets disponibles (deben coincidir con src/presets.ts).
const PRESETS = ["amenaza", "numero", "split", "aurora"];

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const has = (name) => args.includes(name);
const isValue = (a, i) => args[i - 1] === "--preset" || args[i - 1] === "--out";
const guionPath = args.find((a, i) => !a.startsWith("--") && !isValue(a, i));

const die = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

if (!guionPath) die("Uso: node scripts/nuevo-video.mjs <guion.json> [--preset amenaza|numero|split|aurora] [--out out/x.mp4] [--check]");
if (!existsSync(guionPath)) die(`No existe el archivo: ${guionPath}`);

const preset = flag("--preset") ?? "amenaza";
if (!PRESETS.includes(preset)) die(`Preset inválido: "${preset}". Válidos: ${PRESETS.join(", ")}.`);

let guion;
try {
  guion = JSON.parse(readFileSync(guionPath, "utf8"));
} catch (e) {
  die(`El JSON de ${guionPath} tiene un error de sintaxis: ${e.message}`);
}

// --- Validación (esquema zod compartido, compilado al vuelo) --------------
mkdirSync("out", { recursive: true });
const schemaTmp = resolve("out/.guionSchema.mjs");
await esbuild.build({
  entryPoints: [resolve("src/guionSchema.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: schemaTmp,
  logLevel: "silent",
});
const { parseGuion } = await import(pathToFileURL(schemaTmp).href);
rmSync(schemaTmp, { force: true });

try {
  parseGuion(guion, basename(guionPath));
} catch (e) {
  die(e.message);
}
console.log(`✓ Guion válido: ${basename(guionPath)}`);

// Si el guion declara intro pero el PNG aún no se generó, avisar y arrancar
// directo en la portada (evita que <Img> rompa el render por archivo faltante).
if (guion?.intro?.archivo) {
  const artePath = resolve(join("public", guion.intro.archivo));
  if (!existsSync(artePath)) {
    console.warn(
      `⚠ El intro apunta a ${guion.intro.archivo} pero ese PNG no existe.\n` +
        `  Generalo con: node scripts/generar-imagen.mjs ${guionPath}\n` +
        `  Por ahora se renderiza sin intro (arranca en la portada).`
    );
    delete guion.intro.archivo;
  }
}

if (has("--check")) {
  console.log("  (solo validación, no se renderizó)");
  process.exit(0);
}

// --- Render ---------------------------------------------------------------
const nombre = basename(guionPath).replace(/\.json$/i, "");
const corto = has("--corto");
const comp = corto ? "Corto" : "Carrusel";
const sufijo = corto ? "-corto" : "";
const out = flag("--out") ?? `out/${nombre}${sufijo}.mp4`;
mkdirSync(dirname(resolve(out)), { recursive: true });

// Props que recibe la composición genérica (Carrusel o Corto): preset + guion.
const propsPath = resolve(`out/.props-${nombre}.json`);
writeFileSync(propsPath, JSON.stringify({ presetKey: preset, guion }));

console.log(`▶ Renderizando ${corto ? "CORTO ~10s" : "video"} "${nombre}" (preset: ${preset}) → ${out}`);
const r = spawnSync("npx", ["remotion", "render", comp, out, "--props", propsPath], { stdio: "inherit", cwd: resolve(".") });
rmSync(propsPath, { force: true });
process.exit(r.status ?? 0);
