// Tablero de contenido: cuánto conocimiento tienes cargado, cuánto produjiste y
// cuánto queda pendiente en el banco de ideas. Da la foto de "nunca parar".
//   npm run estado
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const cnt = (dir, filtro) => (existsSync(dir) ? readdirSync(dir).filter(filtro) : []);

// 1) Biblioteca: transcripciones cargadas (fuentes de conocimiento)
const bib = cnt("biblioteca", (f) => /\.(txt|md)$/i.test(f) && f.toLowerCase() !== "leeme.md");

// 2) Temas producidos: subcarpetas de temas/ con su guion
const temas = cnt("temas", (f) => {
  const p = join("temas", f);
  return existsSync(p) && statSync(p).isDirectory() && f !== "_" && !f.startsWith(".");
}).filter((t) => existsSync(join("temas", t, `${t}.json`)) || existsSync(join("temas", t, "guion.json")));

// 3) Banco de ideas: filas por estado
let ideas = 0, produccion = 0, publicado = 0;
if (existsSync("banco-de-ideas.md")) {
  for (const ln of readFileSync("banco-de-ideas.md", "utf8").split(/\r?\n/)) {
    if (!/^\|\s*\d+\s*\|/.test(ln)) continue; // filas de datos (empiezan con | N |)
    const cells = ln.split("|").map((c) => c.trim()).filter(Boolean);
    const est = cells[cells.length - 1];
    if (est === "idea") ideas++;
    else if (est === "produccion") produccion++;
    else if (est === "publicado") publicado++;
  }
}

const line = "─".repeat(46);
console.log(`\n📊 ESTADO DEL CONTENIDO\n${line}`);
console.log(`  📚 Biblioteca (fuentes cargadas):   ${bib.length}`);
console.log(`  🎬 Temas producidos (temas/):        ${temas.length}`);
console.log(`  🧠 Banco de ideas:`);
console.log(`       · sin producir (idea):          ${ideas}`);
console.log(`       · en producción:                ${produccion}`);
console.log(`       · publicado:                    ${publicado}`);
console.log(line);

// Potencial: cada fuente rinde ~8-10 ángulos. Estimación de "cuánto queda".
const potencial = bib.length * 9;
const cubierto = publicado + produccion;
const restante = Math.max(0, potencial - cubierto - ideas);
if (bib.length) {
  console.log(`  ✨ Potencial estimado: ~${potencial} piezas (${bib.length} fuentes × ~9 ángulos)`);
  console.log(`     Ya en juego: ${cubierto} · anotadas sin producir: ${ideas} · sin explorar: ~${restante}`);
} else {
  console.log(`  ⚠ Biblioteca vacía. Deja transcripciones en biblioteca/ para arrancar.`);
}
console.log(`\n  Para ideas nuevas: pídele a Claude "dame ideas de contenido".\n`);
