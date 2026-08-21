# Instalar desde el chat (runbook para Claude)

Cuando la persona abra Claude Code en esta carpeta y diga algo como "instala
este proyecto", "configúralo", "déjalo listo" — **haces tú todo el setup por
detrás con comandos** y le hablas en simple, en "tú", sin tecnicismos. No la
mandes a la Terminal ni a correr scripts: tú ejecutas.

## Pasos (ejecútalos tú, uno por uno)

1. **Saluda y avisa** que lo vas a dejar listo en un par de minutos, sin que
   tenga que tocar nada técnico.

2. **Revisa lo básico** (corre en silencio y solo comenta si falta algo):
   - `node -v` y `python3 --version`.
   - Si falta **Node**: dile que lo instale desde nodejs.org (versión LTS) y que
     te avise cuando esté; es lo único que no puedo instalar por él. Igual con
     **Python 3** (python.org) si falta.
   - `ffmpeg -version`: si no está, no bloquees — avisa que solo hace falta para
     unir varios clips (`brew install ffmpeg` cuando quiera).

3. **Instala la skill:** copia `contenido/` de esta carpeta a
   `~/.claude/skills/contenido/` (rsync/cp, excluyendo `.git`).

4. **Crea su carpeta de trabajo:** pregúntale en el chat dónde crearla
   (sugerí `~/EasyMeli-Contenido`), copia ahí `contenido/video-template/`
   (excluyendo `node_modules` y `.env`), y crea `.env` desde `.env.ejemplo`.

5. **Instala dependencias** dentro de la carpeta de trabajo: `npm install` y
   `python3 -m pip install --user Pillow`. Avisa que puede tardar unos minutos y
   dale tranquilidad mientras corre.

6. **Confirma** en simple: "Listo, ya quedó instalado. No tuviste que tocar nada
   técnico 🙌". Y **sigue de largo con el onboarding** de
   `~/.claude/skills/contenido/SKILL.md` (fotos → clave de Gemini → evaluación de
   voz → objetos → producir). No hace falta que la persona escriba `/contenido`:
   enlaza directo.

## Reglas
- Háblale en **"tú"**, cálido y simple. Nada de jerga ("rsync", "dependencias",
  "bash") en lo que ve la persona: por dentro haces los comandos, por fuera dices
  "estoy dejando todo listo…".
- No le pidas que abra la Terminal ni archivos. Todo lo corres tú.
- Lo único que puede necesitar de ella: instalar Node/Python si faltan (con
  link), y pegar su clave de Gemini (en su momento del onboarding).
