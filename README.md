# 🎬 Fábrica de contenido Easy Meli

Herramienta para convertir **una grabación tuya + un texto** en un paquete
completo de TikTok: video editado (subtítulos, cámara, objetos 3D, tu cara),
carrusel, corto, post de Skool y hashtags. Todo con un comando. Sin programar.

Es una **skill de Claude Code**: una vez instalada, le hablás por chat y ella te
guía paso a paso (te pide tus fotos, el contenido, y arma el video por vos).

---

## ✅ Antes de instalar — qué necesitás en tu computador

| Programa | Para qué | Cómo se instala |
|---|---|---|
| **Node.js** (LTS) | El motor de la herramienta | Bajalo de [nodejs.org](https://nodejs.org) |
| **Python 3** | El carrusel | Mac: ya viene / `brew install python` · Windows: [python.org](https://python.org) |
| **ffmpeg** *(opcional)* | Unir varios clips con transiciones | Mac: `brew install ffmpeg` |
| **Claude Code** | Donde corre la skill | Ya lo tenés si vas a usar esto |
| Una **clave de Gemini** | Genera las imágenes con tu cara | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — **cada uno la suya** |

> ⚠️ **Cada persona usa SU propia clave de Gemini.** El cobro de las imágenes va
> a quien la use. Nunca compartas tu clave ni la subas a GitHub.

---

## 📥 Instalación (una vez, casi todo desde el chat)

### 1. Descarga el proyecto
- **Opción fácil:** botón verde **Code → Download ZIP**, y descomprímelo.
- **Con git:** `git clone <url-del-repo>`

### 2. Ábrelo en Claude Code y pídele que lo instale
Abre **Claude Code** dentro de la carpeta descargada y escribe:

> **"instala este proyecto"**

Claude hace **todo el setup por ti** (deja la skill lista, crea tu carpeta de
trabajo, instala lo que hace falta) hablándote en simple. No tienes que tocar la
Terminal ni correr scripts. Lo único que quizás te pida, solo si te falta, es
instalar **Node** (nodejs.org) o **Python** (python.org).

*(¿Prefieres el modo técnico? También puedes hacer doble-clic en `instalar.command`
en Mac, o `bash instalar.sh`. Es opcional.)*

### 3. Tu clave de Gemini
No hace falta abrir archivos: cuando Claude te la pida en el chat, **pégala ahí**
y él la guarda solo (sácala en aistudio.google.com/apikey — cada uno la suya).

---

## ▶️ Cómo se usa (te guía la skill)

1. Abrí **Claude Code** dentro de tu carpeta de trabajo.
2. Escribí en el chat: **`/contenido`** (o "quiero crear contenido").
3. La skill te va a pedir, en orden (todo obligatorio):
   - **Tus 5 fotos** (para que el personaje seas tú). Las mandas por el chat.
   - **Tu clave de Gemini** (la pegas en el chat, la guarda ella).
   - **Tu ADN de voz (evaluación obligatoria)**: una entrevista corta (te hace
     unas preguntas y un mini roleplay) para capturar tu voz. Sin ella no se
     avanza — cada persona del equipo hace la suya.
   - **El contenido** que quieres (pegas el texto de una clase). Ella crea el
     archivo en la biblioteca por ti.
   - Y arma el guion, el libreto, y todo lo demás.

**No tenés que crear archivos ni ordenar carpetas** — la skill lo hace por vos.

Para ver el manual completo, abrí **`MANUAL.md`**.

---

## 🧠 Qué hace por dentro (resumen)

- `contenido/` → la skill (se instala en `~/.claude/skills/contenido`).
- Tu carpeta de trabajo → donde vivís tu contenido:
  - `biblioteca/` — todas las transcripciones (el pozo de ideas).
  - `temas/<tema>/` — cada video en producción (guion + grabaciones + capturas).
  - `referencias/` — tus fotos de cara (privadas, no se suben).
  - `out/<tema>/` — lo terminado, listo para publicar.

---

## ❓ Problemas comunes

- **"falta Node / Python"** → instalalos (tabla de arriba) y corré el instalador de nuevo.
- **Las imágenes no se generan** → te falta poner tu clave en `.env`.
- **Los clips no se unen con transiciones** → instalá ffmpeg (`brew install ffmpeg`).
- **"no se puede abrir instalar.command"** (Mac) → clic derecho → Abrir → Abrir.
