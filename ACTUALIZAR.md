# Actualizar el proyecto (runbook para Claude)

Cuando alguien que **ya tenía el proyecto** diga "actualiza el proyecto", "trae
los últimos cambios", "actualízalo" — **haces tú todo por detrás** y le hablas en
simple, en "tú". Lo importante: **traer el código nuevo SIN borrar sus cosas
personales** (fotos, clave, voz, biblioteca, temas grabados).

## Qué NO se toca nunca (son suyas)
- `.env` (su clave de Gemini)
- `referencias/` (sus fotos)
- `Mi-ADN-VOZ/voice-dna.json` y `Mi-ADN-VOZ/muestras/` (su voz)
- `biblioteca/`, `temas/`, `public/` y `out/` (su contenido y grabaciones)

Todo eso vive en su carpeta de trabajo o está en `.gitignore`, así que un
`git pull` no lo pisa. Igual, al copiar código a la carpeta de trabajo, copia
**solo** `src/` y `scripts/` (nunca las carpetas de arriba).

## Pasos (ejecútalos tú)

1. **Avisa** que vas a traer las mejoras sin borrar nada suyo.

2. **Ubica el repo clonado** (donde está este archivo). Si no lo encuentras,
   clónalo de nuevo en una carpeta aparte con `git clone <url>` y sigue desde ahí.

3. **Trae los cambios:** en la carpeta del repo, `git pull`. (Si clonó por ZIP y
   no tiene git, baja el ZIP nuevo y reemplaza la carpeta del repo — sus cosas
   están en la carpeta de trabajo, no en el repo.)

4. **Actualiza la skill:** copia `contenido/` del repo a
   `~/.claude/skills/contenido/` (rsync/cp, excluyendo `.git`). Sobrescribir está
   bien: la skill no guarda nada personal.

5. **Actualiza el código de su carpeta de trabajo** (pregúntale cuál es si no la
   sabes): copia **solo** `contenido/video-template/src/` y
   `contenido/video-template/scripts/` sobre su carpeta de trabajo. **No** copies
   `.env`, `referencias/`, `temas/`, `biblioteca/`, `public/` ni
   `Mi-ADN-VOZ/voice-dna.json`.

6. **Dependencias:** corre `npm install` en la carpeta de trabajo (por si hay
   paquetes nuevos). Las opcionales (efecto "detrás") solo si las quiere:
   `pip install -r requirements-detras.txt`.

7. **Confirma** en simple qué mejoró (ej.: "ahora los objetos pueden salir detrás
   de ti") y que sus fotos, clave y voz siguen intactas.

## Reglas
- Nunca borres ni sobrescribas sus datos personales (lista de arriba).
- Háblale en **"tú"**, sin jerga. Tú corres los comandos; él no toca la Terminal.
