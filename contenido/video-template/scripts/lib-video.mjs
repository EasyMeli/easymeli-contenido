// Une 1 o varios clips en un solo mp4 9:16 con transiciones profesionales
// (estilo TikTok). Usa el ffmpeg que trae Remotion (npx remotion ffmpeg).
import { spawnSync } from "node:child_process";
import { readFileSync, copyFileSync } from "node:fs";

// Duración en segundos de un mp4 (atom mvhd, offsets correctos v0/v1).
export function duracionSeg(file) {
  const b = readFileSync(file);
  const i = b.indexOf(Buffer.from("mvhd"));
  const v = b[i + 4];
  const ts = v === 1 ? b.readUInt32BE(i + 24) : b.readUInt32BE(i + 16);
  const du = v === 1 ? Number(b.readBigUInt64BE(i + 28)) : b.readUInt32BE(i + 20);
  return du / ts;
}

// Transiciones que rotan entre clip y clip (se ven pro sin marear).
const TRANS = ["smoothleft", "circleopen", "smoothright", "fadeblack", "slideup", "wipeleft"];
const T = 0.35; // duración de cada transición (s)
// Normaliza cada clip a 1080x1920 / 30fps para que el xfade y el render calcen.
const NORM = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p";

// ffmpeg del sistema (soporta xfade). El de Remotion no maneja -filter_complex.
function ffmpegSistema() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0 ? "ffmpeg" : null;
}

export function combinarClips(clips, salida) {
  if (clips.length === 0) throw new Error("No hay clips para combinar.");

  if (clips.length === 1) {
    // Un solo clip: se copia tal cual (rápido, sin recomprimir). El render ya
    // lo encuadra a 9:16 con objectFit cover.
    copyFileSync(clips[0], salida);
    return { transiciones: 0 };
  }

  const bin = ffmpegSistema();
  if (!bin) {
    console.warn("  ⚠ Para unir varios clips con transiciones necesitas ffmpeg (instálalo con: brew install ffmpeg).");
    console.warn("    Por ahora uso solo el primer clip para no romper el flujo.");
    copyFileSync(clips[0], salida);
    return { transiciones: 0, aviso: "sin-ffmpeg" };
  }

  const dur = clips.map(duracionSeg);
  const args = ["-y"];
  clips.forEach((c) => args.push("-i", c));

  const fv = clips.map((_, k) => `[${k}:v]${NORM}[v${k}]`);
  const vchain = [];
  let vlab = "v0";
  let acc = dur[0];
  for (let k = 1; k < clips.length; k++) {
    const off = (acc - T).toFixed(3);
    const tr = TRANS[(k - 1) % TRANS.length];
    const out = `vx${k}`;
    vchain.push(`[${vlab}][v${k}]xfade=transition=${tr}:duration=${T}:offset=${off}[${out}]`);
    vlab = out;
    acc = acc + dur[k] - T;
  }

  const achain = [];
  let alab = "0:a";
  for (let k = 1; k < clips.length; k++) {
    const out = `ax${k}`;
    achain.push(`[${alab}][${k}:a]acrossfade=d=${T}[${out}]`);
    alab = out;
  }

  const filter = [...fv, ...vchain, ...achain].join(";");
  args.push("-filter_complex", filter, "-map", `[${vlab}]`, "-map", `[${alab}]`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-ar", "48000", salida);

  console.log(`  Uniendo ${clips.length} clips con ${clips.length - 1} transición(es) pro…`);
  const r = spawnSync(bin, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg falló combinando los clips");
  return { transiciones: clips.length - 1 };
}
