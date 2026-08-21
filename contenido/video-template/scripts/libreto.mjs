// Saca el LIBRETO (lo que decís a cámara) ANTES de grabar. Necesita solo el
// guion — NO necesita el video. Lo imprime en pantalla y lo guarda en out/<tema>/.
//
//   npm run libreto -- cupones
//
// Flujo pensado:
//   1) Le pegás una transcripción de clase a Claude → te arma temas/<tema>/<tema>.json
//   2) npm run libreto -- <tema>       ← leés esto y grabás
//   3) Guardás tus clips en temas/<tema>/grabaciones/
//   4) npm run todo -- <tema>          ← arma todo lo demás
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolverTema } from "./lib-tema.mjs";

let tema;
try { tema = resolverTema(process.argv.slice(2).find((a) => !a.startsWith("--"))); }
catch (e) { console.error(`\n✖ ${e.message}\n\nUso: npm run libreto -- <tema>   (ej: cupones)\n`); process.exit(1); }
const { guionPath, nombre, outDir } = tema;

const SKILL = process.env.CONTENIDO_SKILL || `${process.env.HOME}/.claude/skills/contenido`;
mkdirSync(resolve(outDir), { recursive: true });
const r = spawnSync("python3", [`${SKILL}/scripts/teleprompter.py`, guionPath, "--out", `${outDir}/${nombre}-teleprompter.md`], { stdio: "inherit", cwd: resolve(".") });
process.exit(r.status ?? 0);
