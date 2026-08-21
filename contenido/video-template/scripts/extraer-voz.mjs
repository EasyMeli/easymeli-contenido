// Extrae TUS mensajes del historial local de Claude Code (esta máquina) para
// sembrar tu ADN de voz sin que tengas que pegar nada. Junta solo lo que
// ESCRIBISTE tú (no las respuestas de la IA, no resultados de herramientas, no
// comandos ni system-reminders) en un archivo que después Claude analiza.
//
//   node scripts/extraer-voz.mjs            (todo el historial de la máquina)
//   node scripts/extraer-voz.mjs --max 60000
//
// Salida: Mi-ADN-VOZ/muestras/_historial.txt  (personal, fuera de git)
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const MAX = Number((args.includes("--max") && args[args.indexOf("--max") + 1]) || 60000);
const MIN_LEN = 45;      // descarta mensajes muy cortos ("si", "dale", "hazlo")
const MAX_LEN = 1500;    // recorta pegados largos (transcripciones, docs) para no sesgar
const HOME = process.env.HOME;
const ROOT = join(HOME, ".claude", "projects");

// Marcadores de contenido INYECTADO (no lo escribió la persona): recordatorios
// del sistema, comandos, cuerpos de skills que se cargan como "user", etc.
const basura = [
  "<system-reminder>", "<local-command", "caveat: the messages below",
  "[Request interrupted", "This session is being continued", "<command-name>",
  "<command-message>", "tool_use_error", "stdout>", "Please continue",
  "Continue from where", "Base directory for this skill", "SessionStart hook",
  "superpowers:", "## Overview", "REQUIRED BACKGROUND", "You MUST", "```",
  "Contents of ", "IMPORTANT: ", "<task-notification>", "<task-id>",
  "<output-file>", "Intentar de nuevo",
];

// ¿este texto lo escribió de verdad la persona? (no comando, no sistema, no doc)
function esVoz(t) {
  if (!t || t.length < MIN_LEN) return false;
  if (t.trimStart().startsWith("/")) return false;               // slash command
  if (t.trimStart().startsWith("#")) return false;               // doc/markdown
  for (const b of basura) if (t.includes(b)) return false;
  if ((t.match(/\n#{1,6}\s/g) || []).length >= 2) return false;  // dump de doc
  if ((t.match(/^\s*[-*]\s/gm) || []).length >= 6) return false; // lista larga pegada
  return true;
}

function textoDeMensaje(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    // solo partes de texto escritas por la persona; NUNCA tool_result
    return content.filter((p) => p && p.type === "text" && typeof p.text === "string").map((p) => p.text).join("\n");
  }
  return "";
}

const vistos = new Set();
const muestras = [];
let total = 0;

// archivos más recientes primero (voz actual pesa más)
let files = [];
try {
  for (const d of readdirSync(ROOT)) {
    const dir = join(ROOT, d);
    try { for (const f of readdirSync(dir)) if (f.endsWith(".jsonl")) files.push(join(dir, f)); } catch {}
  }
} catch { console.error("No encontré el historial en", ROOT); process.exit(1); }
files.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);

outer: for (const file of files) {
  let lines;
  try { lines = readFileSync(file, "utf8").split(/\r?\n/); } catch { continue; }
  for (const line of lines) {
    if (!line.trim()) continue;
    let o; try { o = JSON.parse(line); } catch { continue; }
    if (o.type !== "user" || !o.message) continue;
    let t = textoDeMensaje(o.message.content).trim();
    if (!esVoz(t)) continue;
    if (t.length > MAX_LEN) t = t.slice(0, MAX_LEN) + "…";
    const key = t.slice(0, 80);
    if (vistos.has(key)) continue;      // dedup (mensajes repetidos)
    vistos.add(key);
    muestras.push(t);
    total += t.length;
    if (total >= MAX) break outer;
  }
}

mkdirSync("Mi-ADN-VOZ/muestras", { recursive: true });
const out = "Mi-ADN-VOZ/muestras/_historial.txt";
const cuerpo = `# Extracto de tu historial de Claude Code (${muestras.length} mensajes tuyos)\n# Fuente para tu ADN de voz. Es tu forma de escribir en el chat.\n\n` +
  muestras.map((m, i) => `--- mensaje ${i + 1} ---\n${m}`).join("\n\n");
writeFileSync(out, cuerpo);
console.log(`✓ ${muestras.length} mensajes tuyos → ${out} (${Math.round(total / 1000)}k caracteres)`);
console.log(`  Ahora dile a Claude: "usa Mi-ADN-VOZ/muestras/_historial.txt para armar mi ADN de voz".`);
