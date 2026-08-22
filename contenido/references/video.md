# Carruseles tipo video (Remotion)

Los carruseles también se producen como **video vertical animado** (más
retención que las imágenes fijas; el video es lo que hace que la gente le
escriba a una cara). Se hacen con Remotion (React que renderiza video).

## Plantilla

`video-template/` (dentro de esta skill) es un proyecto Remotion completo
y reutilizable, con el sistema de marca ya adentro. No incluye
`node_modules` — se reinstala.

Para arrancar un video nuevo:

```bash
cp -R ~/.claude/skills/contenido/video-template ./mi-video
cd mi-video && npm install
npm run dev        # estudio en vivo: previsualizas los 3 presets
npm run render     # exporta el preset por defecto (amenaza) a out/video.mp4
```

Requiere Node. El primer `npm install` baja ~1 GB (incluye el navegador de
render). Avisar del techo si la máquina es lenta.

## Arquitectura

- `src/brand.ts` — tokens de color y fuentes (mismos que el generador de
  PNG: navy, azul, amarillo señal).
- `src/fonts.ts` — carga las .ttf locales de `public/fonts/`.
- `src/ui.tsx` — piezas de marca reutilizables:
  - `SceneBg` — fondo navy + vignette + marca de agua + **zoom lento
    (Ken Burns)** que mantiene la escena viva.
  - `Stage` — zona de contenido entre header y footer que reparte los
    bloques en columna con `gap` **garantizado**: nada choca aunque el
    texto crezca. (Esto reemplazó el posicionamiento con `top` fijo, que
    causaba que los textos largos se encimaran.)
  - `Header`, `Footer` — marca completa de las slides internas.
  - `Reveal` — entrada escalonada (sube + aparece) con `spring`.
- `src/Portada.tsx` — portada animada estilo AMENAZA (líneas escalonadas,
  el amarillo hace *pop* con glow). Es la que frena el scroll.
- `src/scenes.tsx` — las 5 escenas internas (mecanismo, desglose con
  ledger tipo factura, por qué, dónde duele, cierre con tarea).
- `src/Carrusel.tsx` — encadena todo con `TransitionSeries`
  (slide/wipe/fade), calcula la **duración por lectura** y agrega la capa
  de **efectos de sonido**.
- `src/Root.tsx` — registra la composición `Carrusel`.

## Reglas aprendidas (no romper)

1. **Duración por lectura, nunca fija.** Cada slide dura según su texto:
   `entrada + palabras / READ_WPS + respiro`. La constante `READ_WPS` en
   `Carrusel.tsx` controla el ritmo de todo el video (bajala a 2.8 si va
   rápido, subila si va lento). Actualiza el conteo de palabras de cada
   slide en el objeto `DUR` cuando cambies el copy.

2. **Una slide, una idea, mínimas palabras.** Si una slide necesita más de
   ~3-4s para leerse, casi siempre sobra texto, no falta tiempo. Máximo
   ~12 palabras por slide. Menos texto = títulos más grandes = más punch =
   más retención hacia el cierre/CTA.

3. **Layout con `Stage`, no coordenadas fijas.** Garantiza separación.

4. **Portada = amenaza en 2ª persona, un foco, un amarillo.** Validar en
   miniatura (ver `carruseles.md`).

5. **Música: NUNCA quemar el sonido trending en el mp4.** Se pierde el
   empujón del algoritmo (TikTok no lo reconoce como ese sonido) y arriesga
   silenciado por copyright. El video se exporta con **efectos propios**
   (`public/sfx/`, sintetizados y libres de derechos: whoosh + impacto en
   cada transición) y el **sonido trending se agrega dentro de TikTok** al
   subir. Los efectos son cortos y graves: no compiten con la música.

## Zona segura de TikTok (CRÍTICO)

El video es 1080×1920 (9:16), pero TikTok **tapa los bordes** con su
interfaz: botones a la derecha (like/comentar/compartir), usuario +
descripción + sonido abajo, y el marco del celular recorta los lados.
Texto pegado al borde se ve incómodo o queda tapado.

Todo el layout respeta márgenes seguros, definidos en `ui.tsx`:

- `MARGIN = 112` — margen lateral (antes 86 era muy justo). `SAFE_W` se
  deriva de ahí. `Stage`, `Header`, `Footer` y `Portada` lo usan.
- Contenido alineado a la **izquierda** (los botones de TikTok están a la
  derecha). Lo alineado a la derecha (montos del `ledger`, caja del CTA)
  se acota en ancho (~720px) para no caer bajo los botones.
- **Regla firme: si un texto no entra en el margen seguro, se achica —
  nunca se deja tocando el borde.** El margen manda sobre el tamaño. Todo
  texto pasa por auto-ajuste: `titleSize()` para títulos/cuerpos/citas
  (baja el cuerpo si la palabra más larga no cabe) y `fit()` en la
  portada. Al escribir un layout nuevo, todo `fontSize` de texto debe
  envolverse en `titleSize(texto, base, em)` — nunca un tamaño fijo pelado.
  (em ≈ 0.62 para Archivo Black, ≈ 0.44 para Barlow Condensed.)
- El CTA y el contenido importante viven sobre los ~1580px; la franja
  inferior queda para la descripción/usuario de TikTok.

Para verificar: renderiza un frame y superpone las zonas (botones der. ~
150px, franja inf. ~320px). Nada importante debe caer ahí.

## Efectos disponibles (add-ons de Remotion)

Instalados y listos para usar cuando un video lo pida (evitar que se vean
planos, sin romper la marca):

- **`@remotion/noise`** — ruido orgánico (Perlin). Ya se usa en el fondo
  `aurora` (`backgrounds.tsx`): manchas de luz de marca que derivan lento.
- **`@remotion/motion-blur`** — desenfoque/estela en lo que se mueve
  rápido. Hace las transiciones y entradas más suaves, menos "a saltos".
- **`@remotion/lottie`** — reproduce animaciones Lottie (íconos animados
  de After Effects, JSON). Íconos/ilustraciones que se mueven, calidad
  estudio.
- **`@remotion/layout-utils`** — mide texto real (`measureText`); permite
  hacer el auto-ajuste de márgenes exacto en vez de heurístico.
- **`@remotion/animation-utils`** — helpers para animaciones complejas.
- **`@remotion/google-fonts`**, **`@remotion/gif`** — fuentes de Google y
  GIFs animados, por si se necesitan.

Ya venían con el core: `transitions` (transiciones), `shapes` (formas),
`paths` (animar trazos SVG), `media-utils` (ondas de audio), `captions`
(subtítulos quemados — suben retención en TikTok).

No instalados (pesados/nicho, se agregan si hace falta): `three` (3D),
`skia` (shaders), `rive`.

**Estado actual (qué ya está aplicado):**
- **Música**: `public/sfx/suspense.wav` (pista original de suspenso/intriga,
  sintetizada, libre de derechos) reemplaza los whoosh/impactos. Se toca de
  fondo en `Carrusel.tsx` (`Music`), con un impacto grave por transición.
- **Motion-blur**: `CameraMotionBlur` envuelve las escenas en `Carrusel.tsx`
  → las transiciones y entradas tienen estela; lo estático queda nítido.
  (Sube el tiempo de render ~6x: se renderiza en segundo plano.)
- **Margen exacto**: `fitWidth()` en `ui.tsx` usa `measureText` de
  layout-utils. Reemplaza la estimación: mide el ancho real de cada palabra
  y baja el cuerpo hasta que entra. Lo usan `scenes.tsx` y `Portada.tsx`.
- **Lottie**: `LottieIcon` (`src/LottieIcon.tsx`) está listo, pero necesita
  un `.json` VÁLIDO en `public/lottie/` (de LottieFiles, gratis). Un JSON
  hecho a mano a menudo no parsea (lottie-web es estricto).
- **Captions**: `@remotion/captions` sirve para subtítulos de VOZ. Este
  formato no tiene locución (el texto en pantalla es el mensaje), así que
  los subtítulos aplican recién cuando haya una versión con voz en off.

## Contenido desde datos (guiones/*.json)

El contenido de cada video vive en un **archivo de datos**, no en el
código: `guiones/<tema>.json`. Para un video nuevo se copia un `.json`, se
cambian los textos y se renderiza — sin tocar `.tsx`.

Estructura del guion (esquema en `src/guion.ts`):
- `handle` — el @ del pie.
- `portada` — contenido de los 3 tipos (amenaza / numero / pregunta); el
  preset decide cuál se muestra.
- `escenas[]` — cada una declara su `layout` y sus textos. Layouts:
  - `titulo-cuerpo` — título + cuerpo (opcional `asset` = PNG flotante).
  - `titulo-regla-cuerpo` — título + línea + cuerpo.
  - `desglose` — título + `filas` (concepto/monto) + `total` + cuerpo.
  - `cierre` — dos títulos + `tarea` (recuadro CTA).
  - `numero` — cifra gigante (forma D): `label` + `numero` + `caption`.
  - `cita` — testimonio (forma F): `texto` + `autor` (siempre "un amigo…").

`src/Escena.tsx` mapea `layout` → ladrillos (`Title`, `Body`, `Row`, etc.,
en `scenes.tsx`). `Carrusel.tsx` arma la portada + las escenas desde el
guion y calcula la duración de cada slide con `palabrasEscena` (duración
por lectura). El preset (look) es aparte: el mismo guion se ve en los 4.

Ejemplo completo: `guiones/cupones.json`.

### Validación (zod)

El guion se valida contra `src/guionSchema.ts` (zod). Es la **única fuente de
verdad**: los tipos de `src/guion.ts` se infieren del esquema (`z.infer`), así
esquema y tipos nunca se desincronizan. `parseGuion(data, nombre)` devuelve el
guion tipado o lanza un Error con la lista de problemas **en español** (ruta +
qué está mal), traducidos desde los códigos de zod. Se valida en dos lugares:
- en `Carrusel.tsx` al cargar el guion por defecto (`parseGuion(cuponesJson…)`),
- en el `calculateMetadata` de la composición genérica `Carrusel` (Root.tsx),
  que además calcula la duración desde el guion recibido.

### Script CLI: `nuevo-video`

Renderiza un video desde un JSON sin tocar código:

```
npm run nuevo -- guiones/mi-tema.json                 # preset amenaza, out/mi-tema.mp4
npm run nuevo -- guiones/mi-tema.json --preset numero # elige el look
npm run nuevo -- guiones/mi-tema.json --out out/x.mp4 # salida a medida
npm run nuevo -- guiones/mi-tema.json --corto         # corto ~10s (out/…-corto.mp4)
npm run nuevo -- guiones/mi-tema.json --check         # SOLO valida, no renderiza
```

`scripts/nuevo-video.mjs` primero **valida** (compila `guionSchema.ts` al vuelo
con esbuild y corre `parseGuion` en Node puro — rápido, sin abrir navegador). Si
el guion falla, corta ahí con el mensaje claro. Recién si pasa, arma un archivo
de props `{ presetKey, guion }` y llama a `remotion render` sobre la composición
(`Carrusel` completo, o `Corto` con `--corto`) que deriva su duración del guion.
`npm run check` valida `cupones.json` como atajo. Presets: amenaza, numero,
split, aurora.

### Repurposing: 1 guion → 4 formatos (Fase 2)

El mismo `guion.json` produce cuatro piezas, sin reescribir contenido:

| Formato | Cómo se genera | Herramienta |
|---|---|---|
| **Video** (~22s) | `npm run nuevo -- guiones/x.json` | Remotion `Carrusel` |
| **Corto** (~10s) | `npm run nuevo -- guiones/x.json --corto` | Remotion `Corto` |
| **Carrusel** (PNG) | `python3 scripts/generar_carrusel.py guiones/x.json` | Pillow |
| **Post de Skool** | `python3 scripts/post_skool.py guiones/x.json` | texto |

- **Corto** (`src/Corto.tsx`): recorta el guion a portada + el "golpe"
  (`seleccionCorto`: el `desglose`/`numero`, o la 1ª escena) + el `cierre`, con
  duraciones fijas cortas. Es para "calentar" la cuenta y como gancho rápido.
- **Post de Skool** (`scripts/post_skool.py` en la skill): arma el borrador de
  texto largo del mismo ángulo (formato para explicar con calma lo que en 22s
  no entra, y pedir comentarios). Se pule a mano con la voz de la comunidad.
- El **contador de slides** (`02/06`) ahora se deriva del nº real de escenas
  (`total` hilado a `Escena`/`Header`), así el corto muestra `02/03` correcto.

### Clip intro con imagen IA (Gemini)

El video puede abrir con un **clip introductorio**: una imagen impactante del
tema, generada por IA y **animada** (zoom lento tipo Ken Burns + drift +
barrido de luz + viñeta) durante ~2s, y recién después entra la portada (el
hook) con un fundido. Sube la retención en el primer segundo. Es opcional: sin
imagen, el video arranca directo en la portada.

Flujo (todo desde el guion, sin tocar código):
1. El guion trae `intro.prompt` (el prompt de la imagen) e `intro.archivo`
   (ruta en `public/`, ej. `ai/<nombre>-intro.png`). La skill escribe el prompt
   al armar el guion (ver receta abajo).
2. `export GEMINI_API_KEY="..."` (clave de Google AI Studio, una vez).
3. `node scripts/generar-imagen.mjs guiones/<tema>.json` → llama a Gemini
   (`gemini-2.5-flash-image`, "Nano Banana"), guarda el PNG en `public/`.
4. `npm run nuevo -- guiones/<tema>.json` → el video abre con el intro animado.
   Si el PNG no existe todavía, el CLI avisa y arranca en la portada (no rompe).

Piezas: `src/Intro.tsx` (imagen a sangre con zoom/drift/light-sweep/viñeta +
scrim navy abajo + marca mínima). `Carrusel.tsx` y `Corto.tsx` la anteponen si
`intro.archivo` existe, con un `fade()` hacia la portada. `intro` en el esquema
(`guionSchema.ts`). Duración: `INTRO_DUR` (64f en el video, 48f en el corto).
La clave se lee de `.env`/entorno; nunca se hardcodea.

**Tu cara en los videos (consistencia de personaje).** Si el intro trae
`persona: true`, el generador adjunta las fotos de la carpeta `referencias/`
(hasta 5) al pedido de Gemini, y antepone al prompt una instrucción para que el
personaje de la escena sea la MISMA persona de las fotos (misma cara/identidad).
Nano Banana está hecho para esto (character consistency). Las fotos son
privadas: quedan locales, van solo a la API cuando generas, y están
gitignoreadas (`referencias/*`, ver `referencias/LEEME.md` para qué fotos
usar). Sin fotos, avisa y genera un personaje genérico. El prompt del guion
describe la escena en tercera persona neutra ("La persona…"); la identidad la
fijan las fotos.

**Formato 9:16.** El video final siempre es 1080x1920 (composición fija +
`objectFit: cover` en la Intro). Además el script pide la imagen vertical en el
parámetro de la API (`generationConfig.imageConfig.aspectRatio: "9:16"`), no
solo en el prompt, para que Gemini genere tall de una y el cover casi no
recorte (evita regenerar por una imagen cuadrada mal encuadrada). El costo es
por imagen generada, ~igual sea cual sea el aspecto: el ahorro real es no tener
que regenerar.

**Receta del prompt (para que salga on-brand y se pueda animar como escena):**
- Es una **escena** que anima bien: un sujeto claro con profundidad (persona,
  objeto, situación), no un patrón plano. Ej. cupones = un vendedor de noche
  frente al notebook aplicando el panel de promociones, sin darse cuenta.
- Estilo: fotográfico cinematográfico o ilustración con profundidad, alto
  contraste, dramático.
- Paleta: azul marino `#0A162E` de ambiente + un acento amarillo `#FFC400`.
- Composición: vertical 9:16, profundidad de campo, luz motivada (monitor).
- Prohibido en la imagen: **texto legible, letras, números, logos de marcas
  reales** (los modelos los renderizan mal; el texto lo pone Remotion).

## Sistema de presets (variación entre videos)

Para que los videos no se vean monótonos, **la marca es constante pero la
estructura rota**. Un `preset` (`src/presets.ts`) combina cuatro ejes:

- **cover** — estilo de portada: `amenaza` (líneas en 2ª persona),
  `numero` (cifra gigante con glow), `pregunta` (anillo amarillo).
- **motion** — entrada del texto: `rise` (sube), `scale` (escala),
  `blur` (desenfoque).
- **texture** — fondo: `vignette`, `grid`, `diagonal`, `dots`.
- **transPack** — set de transiciones: `slide`, `wipe`, `mix`.

Tres presets listos:

| Preset | Portada | Motion | Textura | Transiciones |
|---|---|---|---|---|
| `amenaza-dinamica` | amenaza | rise | vignette | slide |
| `numero-editorial` | numero | scale | grid | wipe |
| `comparacion-split` | pregunta | blur | diagonal | mix |

Cada preset es su propia composición: `Carrusel-amenaza-dinamica`,
`Carrusel-numero-editorial`, `Carrusel-comparacion-split`. Se previsualizan
las tres en `npm run dev` y se renderizan por separado:

```bash
npx remotion render Carrusel-numero-editorial out/video.mp4
```

**Regla (igual que las 6 formas): nunca dos videos seguidos con el mismo
preset.** Para sumar presets nuevos, agrega una entrada a `PRESETS` en
`presets.ts` combinando los ejes de otra forma. Para texturas o motions
nuevos, amplía `textureStyle` / `motionStyle` en `presets.ts` y `ui.tsx`.

El contenido (texto de cada slide) vive en `scenes.tsx` y en `COVER` de
`Carrusel.tsx`; el preset solo cambia cómo se ve y se mueve, no el mensaje.

## Layouts de escena reutilizables

Además de las escenas del carrusel de cupones, `scenes.tsx` exporta
layouts prop-driven para variar la estructura entre videos:

- **`BigNumber`** (`label`, `number`, `caption`) — cifra gigante centrada.
  Para la forma D ("el número que nadie te dice"). Demo: composición
  `DemoNumero`.
- **`Quote`** (`text`, `author`) — cita con comillas grandes y atribución.
  Para "me pasó a mí" o el resultado de un tercero. Respeta la regla de la
  skill: el autor es "un amigo, ...", nunca un nombre identificable. Demo:
  composición `DemoQuote`.

Suma layouts nuevos como componentes que reciban su texto por props y
usen `SceneBg` + `Header` + `Stage` + `Footer` (el `Stage` garantiza la
separación). Las texturas de fondo (`grid`, `diagonal`, `dots`) son
visibles pero suaves — no compiten con el texto.

## Assets de Canva (híbrido visual)

Canva sirve como **fábrica de assets** (ilustraciones, fotos, íconos,
mockups de pantallas de MercadoLibre), no para diseñar el video entero.

**Por qué NO diseñar todo en Canva y aplastar:** Canva exporta imagen
plana (píxeles), Remotion anima elementos. Una imagen aplastada solo se
puede animar entera (zoom/paneo) — se pierde el motion por elemento
(glow, reveals, pops). El híbrido correcto:

**Canva (asset transparente) → capa en Remotion → texto animado encima.**

Flujo:

1. En Canva, diseña/elige el elemento aislado (o encuadra una captura de
   ML dentro de un mockup de celular).
2. Exportá como **PNG con fondo transparente** (`export-design` lo
   soporta: `transparent_background: true`).
3. Descarga el PNG a `public/canva/`.
4. Úsalo con `AssetLayer` (`src/assets.tsx`): posición, tamaño, entrada
   animada (fade+escala), flotación y parallax. Ejemplo en
   `src/AssetDemo.tsx` (composición `AssetDemo`).

```tsx
<AssetLayer src="canva/mockup-cupon.png" x={560} y={760} w={420}
            delay={6} floaty parallax={30} />
```

**Qué assets suman de verdad (opinión de editor):** las **capturas reales
de paneles de MercadoLibre encuadradas** (mockup de celular) rinden más
que ilustraciones genéricas de IA. Lo real prueba el punto; lo decorativo
puede abaratar un video de datos. Canva es ideal para encuadrar/limpiar
esas capturas. Herramientas MCP de Canva disponibles: `generate-design`,
`export-design` (transparente), `get-assets`, `list-brand-kits`
(hay un brand kit conectado).

## Advertencia de entorno

Algún linter/hook del proyecto inyecta props inválidos `durationInFrames`
en el JSX al guardar `.tsx`. En runtime se ignoran (Remotion usa esbuild,
no chequea tipos) y **no rompen el render**, pero ensucian el código. Si
ves errores de TypeScript al editar, ese es el origen: borra esos props.

## Comandos

```bash
npm run dev                                   # estudio en vivo
npm run render                                # exporta el video
npx remotion still Carrusel out/x.png --frame=N   # un frame para revisar
```

Revisar siempre frames a mitad de escena antes del render final: los
choques y desbordes no se ven hasta la imagen renderizada.
