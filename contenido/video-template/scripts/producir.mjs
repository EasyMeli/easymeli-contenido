// UN comando que produce TODO lo mecánico de un guion, sin gastar tokens de
// Claude: imagen intro (Gemini) + video + corto + carrusel + post de Skool +
// descripción/hashtags de TikTok. La parte creativa (elegir el ángulo y
// escribir el guion desde la clase) la hace Claude una vez; esto es el resto.
//
//   node scripts/producir.mjs guiones/cupones.json
//   node scripts/producir.mjs guiones/cupones.json --sin-imagen   (no toca Gemini)
//   node scripts/producir.mjs guiones/cupones.json --imagen       (regenera la imagen)
//   node scripts/producir.mjs guiones/cupones.json --preset numero
//
// La imagen solo se genera si falta el PNG (para no volver a pagar), salvo que
// uses --imagen. Los carruseles/post usan los scripts python de la skill.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, resolve, join } from "node:path";

// Carpeta de los scripts python de la skill (carrusel y post). Se puede
// sobreescribir con la variable de entorno CONTENIDO_SKILL.
const SKILL = process.env.CONTENIDO_SKILL || `${process.env.HOME}/.claude/skills/contenido`;

const args = process.argv.slice(2);
const has = (n) => args.includes(n);
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const guionPath = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--preset");

const die = (m) => {
  console.error(`\n✖ ${m}\n`);
  process.exit(1);
};
if (!guionPath) die("Uso: node scripts/producir.mjs <guion.json> [--sin-imagen] [--imagen] [--preset <p>]");
if (!existsSync(guionPath)) die(`No existe: ${guionPath}`);

const g = JSON.parse(readFileSync(guionPath, "utf8"));
const nombre = basename(guionPath).replace(/\.json$/i, "");
const preset = flag("--preset");
mkdirSync("out", { recursive: true });

const pasos = [];
const run = (label, cmd, cmdArgs) => {
  console.log(`\n━━━ ${label} ━━━`);
  const r = spawnSync(cmd, cmdArgs, { stdio: "inherit", cwd: process.cwd() });
  const ok = r.status === 0;
  pasos.push({ label, ok });
  return ok;
};

// 1) Imagen intro (solo si hace falta / se fuerza) --------------------------
if (g.intro?.prompt) {
  const rel = g.intro.archivo || `ai/${nombre}-intro.png`;
  const existe = existsSync(resolve(join("public", rel)));
  if (has("--sin-imagen")) {
    console.log(`\n(omito la imagen por --sin-imagen)`);
  } else if (existe && !has("--imagen")) {
    console.log(`\n(imagen ya existe: public/${rel} — no la regenero. Usá --imagen para rehacerla.)`);
  } else {
    run("Imagen intro (Gemini ~US$0,04)", "node", ["scripts/generar-imagen.mjs", guionPath]);
  }
}

// 2) Video principal --------------------------------------------------------
const presetArgs = preset ? ["--preset", preset] : [];
run("Video", "node", ["scripts/nuevo-video.mjs", guionPath, ...presetArgs]);

// 3) Corto de 10s -----------------------------------------------------------
run("Corto 10s", "node", ["scripts/nuevo-video.mjs", guionPath, "--corto", ...presetArgs]);

// 4) Carrusel (Pillow, script de la skill) ----------------------------------
run("Carrusel", "python3", [`${SKILL}/scripts/generar_carrusel.py`, guionPath]);

// 5) Post de Skool (script de la skill) -------------------------------------
run("Post de Skool", "python3", [`${SKILL}/scripts/post_skool.py`, guionPath, "--out", `out/${nombre}-skool.md`]);

// 6) Descripción + hashtags de TikTok ---------------------------------------
if (g.publicacion) {
  const tags = (g.publicacion.hashtags || []).map((t) => `#${t}`).join(" ");
  const txt = `${g.publicacion.descripcion}\n\n${tags}\n`;
  writeFileSync(`out/${nombre}-tiktok.txt`, txt);
  pasos.push({ label: "Descripción TikTok", ok: true });
  console.log(`\n━━━ Descripción TikTok ━━━\n✓ out/${nombre}-tiktok.txt`);
} else {
  console.log(`\n(sin bloque "publicacion" en el guion → no genero descripción)`);
}

// Resumen -------------------------------------------------------------------
console.log(`\n\n═══ RESUMEN de "${nombre}" ═══`);
for (const p of pasos) console.log(`  ${p.ok ? "✓" : "✗"} ${p.label}`);
console.log(`\nArchivos en out/:  ${nombre}.mp4 · ${nombre}-corto.mp4 · NN-*.png (carrusel) · ${nombre}-skool.md · ${nombre}-tiktok.txt`);
const fallo = pasos.some((p) => !p.ok);
console.log(fallo ? "\n⚠ Algún paso falló (mirá arriba)." : "\n✅ Todo listo para subir.");
process.exit(fallo ? 1 : 0);
