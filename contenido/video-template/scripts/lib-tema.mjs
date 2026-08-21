// Resuelve un TEMA a sus rutas. Acepta:
//   "cupones"                       → temas/cupones/cupones.json
//   "temas/cupones"                 → temas/cupones/<carpeta>.json  (o guion.json)
//   "temas/cupones/cupones.json"    → ese guion
// Cada tema es UNA carpeta con todo adentro: el guion, grabaciones/ y capturas/.
import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export function resolverTema(arg) {
  if (!arg) throw new Error("Falta el tema. Ejemplo: npm run todo -- cupones");
  let guionPath;
  if (arg.endsWith(".json")) {
    guionPath = arg;
  } else {
    const dir = arg.includes("/") ? arg.replace(/\/+$/, "") : join("temas", arg);
    const nom = basename(dir);
    // primero <tema>.json, si no guion.json, si no el primer .json de la carpeta
    const cand = [join(dir, `${nom}.json`), join(dir, "guion.json")];
    guionPath = cand.find(existsSync);
    if (!guionPath && existsSync(dir)) {
      const j = readdirSync(dir).find((f) => f.endsWith(".json") && !f.endsWith(".captions.json"));
      if (j) guionPath = join(dir, j);
    }
    guionPath = guionPath || cand[0];
  }
  if (!existsSync(guionPath)) {
    throw new Error(`No existe el guion: ${guionPath}\n  (esperaba una carpeta temas/<tema>/ con su guion adentro)`);
  }
  const temaDir = dirname(guionPath);
  const nombre = basename(temaDir);              // el tema = nombre de la carpeta
  return {
    guionPath,
    temaDir,
    nombre,
    grabacionesDir: join(temaDir, "grabaciones"),
    capturasDir: join(temaDir, "capturas"),
    captionsPath: join(temaDir, `${nombre}.captions.json`),
    outDir: join("out", nombre),
  };
}

// Lista los clips .mp4/.mov de un tema, ordenados por nombre (1, 2, 3…).
export function clipsDeTema(grabacionesDir) {
  if (!existsSync(grabacionesDir)) return [];
  return readdirSync(grabacionesDir)
    .filter((f) => /\.(mp4|mov|m4v)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => join(grabacionesDir, f));
}
