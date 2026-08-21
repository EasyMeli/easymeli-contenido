// Genera la BIBLIOTECA de objetos 3D (con Gemini) para las animaciones, todos
// con el mismo estilo (coherentes) y fondo transparente. Se corre UNA vez.
//   node scripts/generar-objetos.mjs            (genera los que falten)
//   node scripts/generar-objetos.mjs --force    (regenera todos)
//   node scripts/generar-objetos.mjs cupon caja (solo esos)
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const key = process.env.GEMINI_API_KEY;
if (!key) { console.error("Falta GEMINI_API_KEY en .env"); process.exit(1); }

// Estilo FIJO para que toda la biblioteca combine: 3D VIBRANTE y colorido.
const ESTILO =
  " Ícono 3D render moderno y VIBRANTE, colores VIVOS y saturados (azul brillante #1E56E8 y amarillo intenso #FFC400 con acentos), " +
  "estilo glossy pulido tipo icono 3D de tendencia, objeto flotando aislado y CENTRADO, iluminación de estudio brillante, sombra sutil, " +
  "sobre FONDO BLANCO PLANO liso (#FFFFFF), sin texto, sin letras, sin números, alta calidad, colorido y llamativo.";

// Biblioteca base de marca (compartida). Un tema puede sumar los SUYOS abajo.
const OBJETOS = {
  cupon: "Un cupón de descuento / ticket",
  etiqueta: "Una etiqueta de precio / tag de promoción con su hilo",
  billete: "Un fajo de billetes de dinero con unas monedas",
  caja: "Una sola caja de cartón de envío cerrada con cinta, simple, nada encima",
  camion: "Un camión de reparto / delivery pequeño",
  grafico: "Un gráfico de barras con una flecha descendente (pérdida)",
  estrella: "Una estrella de calificación con brillo",
  escudo: "Un escudo de protección con un check",
  alerta: "Un signo de exclamación de alerta dentro de un triángulo",
  carrito: "Un carrito de compras de e-commerce",
  candado: "Un candado cerrado",
};

const args = process.argv.slice(2);
const force = args.includes("--force");

// --guion <ruta>: suma los objetos del TEMA (guion.objetos = {nombre: "descripción"})
// y genera SOLO esos (el pack del tema). Así cada persona/tema tiene los suyos.
let objetosTema = [];
const gi = args.indexOf("--guion");
if (gi >= 0 && args[gi + 1]) {
  try {
    const g = JSON.parse(readFileSync(args[gi + 1], "utf8"));
    for (const [nombre, desc] of Object.entries(g.objetos || {})) { OBJETOS[nombre] = desc; objetosTema.push(nombre); }
  } catch (e) { console.error(`No pude leer objetos del guion: ${e.message}`); }
}

const pedidos = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--guion");
const lista = pedidos.length ? pedidos : (objetosTema.length ? objetosTema : Object.keys(OBJETOS));

mkdirSync(resolve("public/objetos"), { recursive: true });

for (const nombre of lista) {
  const concepto = OBJETOS[nombre];
  if (!concepto) { console.log(`(salto ${nombre}: no está en la lista)`); continue; }
  const final = resolve("public/objetos", `${nombre}.png`);
  if (existsSync(final) && !force) { console.log(`✓ ya existe: ${nombre}.png`); continue; }

  console.log(`▶ generando ${nombre}…`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: concepto + "." + ESTILO }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1" } } }),
  });
  if (!r.ok) { console.error(`  ✖ API ${r.status}: ${(await r.text()).slice(0, 160)}`); continue; }
  const d = await r.json();
  const p = (d?.candidates?.[0]?.content?.parts || []).find((x) => x.inlineData?.data);
  if (!p) { console.error(`  ✖ sin imagen para ${nombre}`); continue; }
  const raw = resolve("public/objetos", `_raw_${nombre}.png`);
  writeFileSync(raw, Buffer.from(p.inlineData.data, "base64"));
  const k = spawnSync("python3", [resolve("scripts/quitar-fondo.py"), raw, final], { stdio: "inherit" });
  rmSync(raw, { force: true });
  if (k.status === 0) console.log(`  ✓ ${nombre}.png`);
}
console.log("\nListo. Objetos en public/objetos/");
