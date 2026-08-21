#!/usr/bin/env bash
# Instalador — Fábrica de contenido Easy Meli
# Deja la skill y el proyecto de trabajo listos en tu computador.
set -u
cd "$(dirname "$0")"
REPO="$(pwd)"

b() { printf "\033[1m%s\033[0m\n" "$1"; }
ok() { printf "  \033[32m✓\033[0m %s\n" "$1"; }
no() { printf "  \033[31m✗\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; }

b "════════════════════════════════════════════════"
b "  Instalador — Fábrica de contenido Easy Meli"
b "════════════════════════════════════════════════"
echo

# ── 1) Requisitos ──
b "1) Reviso lo que necesitás instalado…"
faltan=0
have() { command -v "$1" >/dev/null 2>&1; }
if have node; then ok "node $(node -v)"; else no "falta Node — instalalo (LTS) desde https://nodejs.org y volvé a correr esto"; faltan=1; fi
if have npm;  then ok "npm  $(npm -v)"; else no "falta npm (viene con Node)"; faltan=1; fi
if have python3; then ok "python3 $(python3 --version 2>&1 | awk '{print $2}')"; else no "falta Python 3 — Mac: 'brew install python' · Windows: python.org"; faltan=1; fi
if have ffmpeg; then ok "ffmpeg (para unir varios clips)"; else warn "ffmpeg no está — solo hace falta si grabás VARIOS clips por tema. Mac: 'brew install ffmpeg'"; fi

if [ "$faltan" = "1" ]; then
  echo; b "Instalá lo que falta (arriba con ✗) y volvé a correr el instalador."; exit 1
fi
echo

# ── 2) Instalar la skill en ~/.claude/skills/contenido ──
b "2) Instalo la skill…"
SKILL_DIR="$HOME/.claude/skills/contenido"
mkdir -p "$SKILL_DIR"
rsync -a --delete-excluded --exclude '.git' "$REPO/contenido/" "$SKILL_DIR/" >/dev/null
ok "skill 'contenido' en $SKILL_DIR"
# El módulo Mi-ADN-VOZ NO es una skill suelta: viaja dentro del proyecto
# (video-template/Mi-ADN-VOZ) y 'contenido' lo exige y lo maneja.
echo

# ── 3) Crear la carpeta de trabajo (el proyecto) ──
b "3) Tu carpeta de trabajo (donde vas a crear el contenido)."
DEFAULT_DIR="$HOME/EasyMeli-Contenido"
printf "   ¿Dónde la creo? [Enter = %s]: " "$DEFAULT_DIR"
read -r WORK || true
WORK="${WORK:-$DEFAULT_DIR}"
mkdir -p "$WORK"
rsync -a --exclude 'node_modules' --exclude '.env' "$SKILL_DIR/video-template/" "$WORK/" >/dev/null
ok "proyecto en $WORK"

# .env desde el ejemplo (con la clave vacía)
if [ ! -f "$WORK/.env" ]; then cp "$WORK/.env.ejemplo" "$WORK/.env"; fi
ok ".env creado (falta que pongas TU clave de Gemini)"
echo

# ── 4) Dependencias ──
b "4) Instalo dependencias (puede tardar unos minutos)…"
cd "$WORK"
if npm install >/dev/null 2>&1; then ok "dependencias de Node (Remotion, etc.)"; else no "npm install falló — corré 'npm install' a mano en $WORK"; fi
if python3 -m pip install --user Pillow >/dev/null 2>&1; then ok "Pillow (Python, para el carrusel)"; else warn "no pude instalar Pillow — corré 'python3 -m pip install --user Pillow'"; fi
echo

# ── 5) Listo ──
b "════════════════════════════════════════════════"
b "  ✅ Instalación lista"
b "════════════════════════════════════════════════"
echo "Tu proyecto está en:  $WORK"
echo
b "Últimos pasos (una vez):"
echo "  1) Poné TU clave de Gemini en:  $WORK/.env"
echo "     (la sacás en https://aistudio.google.com/apikey — cada uno la suya)"
echo "  2) Abrí Claude Code dentro de la carpeta:  $WORK"
echo "  3) Escribí en el chat:  /contenido   (o simplemente 'quiero crear contenido')"
echo
echo "La skill te va a guiar sola: primero te pide TUS fotos, después el contenido"
echo "para la biblioteca, y arma el video por vos. No tenés que crear archivos."
echo
