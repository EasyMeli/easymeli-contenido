// Guarda TUS AJUSTES del panel (subtítulos + cámara + títulos) dentro del guion,
// por tema, para que el próximo render los use. Así lo que pruebas en Remotion
// Studio queda persistido como dato (no se pierde).
//
//   node scripts/ajustar-video.mjs guiones/cupones.json --subs-altura 340
//   node scripts/ajustar-video.mjs guiones/cupones.json --subs-letra 64 --subs-estilo resaltado
//   node scripts/ajustar-video.mjs guiones/cupones.json --camara agresivo
//   node scripts/ajustar-video.mjs guiones/cupones.json --titulo-arriba "SI VENDES EN ML" --titulo-abajo "LEE ESTO"
//
// Después: node scripts/producir-hablado.mjs guiones/cupones.json  (usa los ajustes)
import { readFileSync, writeFileSync } from "node:fs";
import { resolverTema } from "./lib-tema.mjs";

const args = process.argv.slice(2);
const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const die = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };
let guionPath;
try { guionPath = resolverTema(args.find((a) => !a.startsWith("--"))).guionPath; }
catch (e) { die(`${e.message}\n\nUso: node scripts/ajustar-video.mjs <tema> [--subs-altura N] [--subs-letra N] [--subs-estilo limpio|resaltado] [--camara auto|reposado|dinamico|agresivo] [--vibe auto|calmado|energetico|epico] [--cta-x 0..1] [--cta-y 0..1] [--titulo-arriba "..."] [--titulo-abajo "..."] [--placa "..."]`); }

const guion = JSON.parse(readFileSync(guionPath, "utf8"));
const v = { ...(guion.video || {}) };
const cambios = [];

const num = (flag, key, min, max) => {
  const raw = val(flag);
  if (raw === undefined) return;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) die(`${flag} debe ser un número entre ${min} y ${max}`);
  v[key] = n; cambios.push(`${key}=${n}`);
};
const opt = (flag, key, opciones) => {
  const raw = val(flag);
  if (raw === undefined) return;
  if (!opciones.includes(raw)) die(`${flag} debe ser uno de: ${opciones.join(", ")}`);
  v[key] = raw; cambios.push(`${key}=${raw}`);
};
const txt = (flag, key) => {
  const raw = val(flag);
  if (raw === undefined) return;
  v[key] = raw; cambios.push(`${key}="${raw}"`);
};

num("--subs-altura", "alturaSubtitulos", 120, 1500);
num("--subs-letra", "tamanoLetra", 30, 120);
opt("--subs-estilo", "estiloSubtitulos", ["limpio", "resaltado"]);
opt("--camara", "estiloCamara", ["auto", "reposado", "dinamico", "agresivo"]);
opt("--vibe", "vibe", ["auto", "calmado", "energetico", "epico"]); // cámara + efectos de una
num("--cta-x", "capturaTargetX", 0, 1); // dónde apunta la flecha del CTA (izq→der)
num("--cta-y", "capturaTargetY", 0, 1); // dónde apunta la flecha del CTA (arriba→abajo)
txt("--titulo-arriba", "tituloArriba");
txt("--titulo-abajo", "tituloAbajo");
txt("--placa", "placa");

if (!cambios.length) die("No pasaste ningún ajuste. Ver el uso arriba.");

guion.video = v;
writeFileSync(guionPath, JSON.stringify(guion, null, 2) + "\n");
console.log(`✓ Guardado en ${guionPath} → video: { ${cambios.join(", ")} }`);
console.log("  Aplica con: node scripts/producir-hablado.mjs " + guionPath);
