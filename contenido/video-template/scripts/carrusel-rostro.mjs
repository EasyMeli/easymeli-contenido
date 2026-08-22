// Genera las imágenes CON TU ROSTRO para el carrusel (portada + cierre), usando
// las fotos de referencia (referencias/) para que el personaje seas TÚ.
// Salen en 9:16 y con "espacio negativo" arriba para que el titular se lea.
//   node scripts/carrusel-rostro.mjs guiones/cupones.json
//   node scripts/carrusel-rostro.mjs guiones/cupones.json --force
//
// El resultado va a public/carrusel-rostro/<nombre>-portada.png y -cierre.png.
// Luego el generador Python del carrusel los compone con el texto de marca.
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { basename, resolve, join } from "node:path";

const MODEL = "gemini-2.5-flash-image";
const args = process.argv.slice(2);
const force = args.includes("--force");
const noFlags = args.filter((a) => !a.startsWith("--"));
const guionPath = noFlags[0];
const soloEscenas = noFlags.slice(1); // opcional: "portada" y/o "cierre"
const die = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };
if (!guionPath) die("Uso: node scripts/carrusel-rostro.mjs <guion.json> [--force]");
if (!existsSync(guionPath)) die(`No existe: ${guionPath}`);

// .env
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
const key = process.env.GEMINI_API_KEY;
if (!key) die("Falta GEMINI_API_KEY en .env");

const guion = JSON.parse(readFileSync(guionPath, "utf8"));
const nombre = basename(guionPath).replace(/\.json$/i, "");

// Fotos de referencia → tu cara
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const refs = (() => {
  const dir = resolve("referencias");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().slice(0, 5)
    .map((f) => ({ inlineData: { mimeType: MIME[f.split(".").pop().toLowerCase()], data: readFileSync(join(dir, f)).toString("base64") } }));
})();
if (!refs.length) die("No hay fotos en referencias/ — no puedo poner tu cara.");

// Estilo común: cinematográfico, navy de marca, foto realista, espacio arriba.
const BASE =
  "IMPORTANTE: la persona debe ser EXACTAMENTE la misma de las fotos de referencia — misma cara, mismos rasgos, misma identidad. " +
  "Fotografía realista, vertical 9:16, cinematográfica, un solo sujeto, encuadre de medio cuerpo. " +
  "Iluminación dramática azul noche (navy #0A162E) con un acento cálido, fondo desenfocado de home-office / e-commerce. " +
  "MUCHO espacio negativo oscuro en la MITAD SUPERIOR del cuadro (para poner un titular encima), el sujeto ocupa la mitad inferior. " +
  "Sin texto, sin letras, sin logos, sin marcas de agua. Alta calidad, colores de marca azul y amarillo sutil.";

// Prompts por escena. Se pueden sobreescribir desde guion.carrusel.
const PROMPTS = {
  portada:
    (guion?.carrusel?.portadaPrompt) ||
    "El sujeto mira su teléfono con expresión de preocupación/sorpresa, dándose cuenta de que algo anda mal con su dinero. Gesto de '¿qué es esto?'. Ambiente de vendedor de MercadoLibre revisando sus ventas.",
  cierre:
    (guion?.carrusel?.cierrePrompt) ||
    "PLANO ABIERTO: el sujeto ocupa solo el TERCIO INFERIOR del cuadro, con los DOS TERCIOS SUPERIORES casi vacíos y oscuros (mucho aire para el titular). Mira a cámara con actitud segura y cercana, media sonrisa, invitando a la audiencia (gesto de 'vení / seguime'). Confianza de mentor, ambiente de creador de contenido.",
};

mkdirSync(resolve("public/carrusel-rostro"), { recursive: true });

for (const [escena, extra] of Object.entries(PROMPTS)) {
  if (soloEscenas.length && !soloEscenas.includes(escena)) continue;
  const dest = resolve("public/carrusel-rostro", `${nombre}-${escena}.png`);
  if (existsSync(dest) && !force) { console.log(`✓ ya existe: ${nombre}-${escena}.png (usa --force para regenerar)`); continue; }
  console.log(`▶ generando ${escena}…`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [...refs, { text: BASE + " ESCENA: " + extra }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "9:16" } },
    }),
  });
  if (!r.ok) { console.error(`  ✖ API ${r.status}: ${(await r.text()).slice(0, 200)}`); continue; }
  const d = await r.json();
  const p = (d?.candidates?.[0]?.content?.parts || []).find((x) => x.inlineData?.data || x.inline_data?.data);
  const b64 = p?.inlineData?.data || p?.inline_data?.data;
  if (!b64) { console.error(`  ✖ sin imagen para ${escena}`); continue; }
  writeFileSync(dest, Buffer.from(b64, "base64"));
  console.log(`  ✓ public/carrusel-rostro/${nombre}-${escena}.png`);
}
console.log("\nListo. Ahora: python3 <skill>/scripts/generar_carrusel.py " + guionPath);
