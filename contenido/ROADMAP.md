# Roadmap de la skill `contenido`

Plan de trabajo para escalar la skill y que evolucione en el tiempo. El
objetivo de todo esto es uno solo: **producir más y mejor contenido, con
menos esfuerzo, para hacer crecer la comunidad Easy Meli (Skool).**

Este archivo es un documento **vivo**: se actualiza al cerrar cada sesión
(mover casilleros a hecho, anotar dónde quedamos). Es la fuente de verdad
del avance — la próxima sesión arranca leyéndolo.

---

## Estado actual

Fecha de arranque del plan: **19-ago-2026**.

| Fase | Recomendación | Estado |
|---|---|---|
| 0 | Base + bitácora (medición) | ✅ hecho (19-ago-2026) |
| 1 | Video desde datos (motor) | ✅ hecho (19-ago-2026) |
| 2 | Repurposing (1 insight → 4 formatos) | ✅ hecho (19-ago-2026) |
| 3 | Calendario semanal con variedad | ✅ hecho (19-ago-2026) |
| 4 | Playbook que aprende + stack vigente | 🟢 activo (continuo) |

**Dónde quedamos:** Fase 1 COMPLETA (19-ago). El motor de video desde datos
quedó cerrado en dos bloques:
- Bloque 1 — contenido desde datos: esquema, renderer `src/Escena.tsx`,
  `guiones/cupones.json`, `Carrusel.tsx` arma portada+escenas desde el guion
  con duración por lectura (`palabrasEscena`).
- Bloque 2 — validación + CLI: `src/guionSchema.ts` (zod, única fuente de
  verdad; `guion.ts` infiere sus tipos), `parseGuion` con errores en español;
  composición genérica `Carrusel` con `calculateMetadata` que deriva duración;
  script `scripts/nuevo-video.mjs` (`npm run nuevo -- <json> [--preset] [--out]
  [--check]`) que valida en Node (esbuild) antes de renderizar.

**Fase 2 (repurposing) — COMPLETA (19-ago).** Un `guion.json` → 4 formatos:
- **Video** (~22s): `npm run nuevo -- guiones/x.json` (Remotion `Carrusel`).
- **Corto** (~10s): `npm run nuevo -- guiones/x.json --corto` (`src/Corto.tsx`,
  `seleccionCorto` = portada + golpe + cierre; contador `total` hilado bien).
- **Carrusel** (PNG): `python3 scripts/generar_carrusel.py guiones/x.json`.
- **Post de Skool**: `python3 scripts/post_skool.py guiones/x.json` (borrador
  de texto largo, se pule a mano).

**Pendiente menor de Fase 2** (paso 4, se cierra cuando toque procesar una
transcripción real): que la skill, al procesar una clase, entregue los 4
formatos + descripción/hashtags (`publicacion.md`) en una sola pasada. La
maquinaria ya está; falta el "pegamento" en el flujo de la skill.

**Fase 3 (calendario) — COMPLETA (19-ago).** `scripts/plan_semana.py` arma
4-5 piezas balanceando 6 formas / 5 terrenos / 4 presets, sin repetir forma
ni preset en días seguidos; rota C↔F y B↔E por semana (no quema las caras),
lee `bitacora.md` (no arranca con la última forma/preset; prioriza lo que
trajo DMs concretos/signups) y marca la última pieza como repurpose gratis.
Uso: `python3 scripts/plan_semana.py [--semana N] [--piezas 4|5] [--out ...]`.
Disparador documentado en `SKILL.md` ("qué publico esta semana").

**Fase 4 (playbook) — ACTIVA (19-ago).** Creado `references/ganadores.md`
(hooks/sonidos/CTAs/recursos que convirtieron, con su métrica + revisión
trimestral del stack) y cableado en `SKILL.md` (consultarlo antes de proponer
hooks; procesar transcripción paso 6). Es continuo: se llena a medida que la
bitácora muestre ganadores. Candidatos en observación cargados (hook de
cupones, sonido "Black Chrome"), pendientes de retención real.

**Las 5 fases del plan quedaron montadas el 19-ago.** De acá en más el trabajo
es de uso y afinado: publicar con el calendario, cargar la bitácora, graduar
ganadores, revisar el stack cada trimestre. Pendientes puntuales: cerrar el
paso 4 de Fase 2 (entregar los 4 formatos + hashtags en una pasada al procesar
una transcripción real) y capturar la retención del video de cupones (releer
TikTok 20-21 ago).

**Mejora extra (19-ago): clip intro con imagen IA (Gemini).** El video puede
abrir con una imagen del tema generada por IA y **animada** (`src/Intro.tsx`:
zoom/drift/light-sweep/viñeta, ~2s) que funde a la portada. El prompt vive en
`intro.prompt` (dato del guion, nivel superior). `scripts/generar-imagen.mjs`
llama a Gemini (`gemini-2.5-flash-image`, clave en `GEMINI_API_KEY`) y guarda el
PNG en `public/ai/`. Carrusel y Corto la anteponen si existe. **VERIFICADO end-to-end (19-ago)**
con la clave real del usuario: Gemini generó una escena fotográfica cinematográfica
(vendedor de noche frente al notebook) en 768x1344 (9:16 nativo vía
`imageConfig.aspectRatio`), animada y fundida al hook; video final 30.42s OK. La
clave vive en `.env` (gitignoreado); el script lo lee solo. Receta del prompt y
flujo en `references/video.md`; disparo en `SKILL.md`. **Consistencia de personaje
(19-ago):** con `intro.persona: true`, el generador adjunta las fotos de
`referencias/` (privadas, gitignoreadas) para que el personaje tenga la cara del
usuario entre videos (Nano Banana character consistency). Falta que el usuario
cargue sus fotos y probarlo. Backlog: usar la misma imagen de intro en la slide 1
del carrusel Pillow.

**Aparte (arreglo 19-ago):** las portadas invadían el margen porque
`measureText` medía antes de cargar `ArchivoBlack` (fuente ancha) → texto
sobredimensionado. Fix en `src/fonts.ts` (espera la carga con
delayRender/continueRender) + respiro `FIT_W` en `src/ui.tsx` + portada de
número centrada. Verificado con stills.

Métricas del video de cupones: retención aún pendiente en TikTok (releer
20-21 ago).

Leyenda: ⬜ pendiente · 🟡 en curso · ✅ hecho · 🟢 activo (continuo)

---

## Orden y dependencias

```
Fase 0 (bitácora)  ──┐
                     ├─→ Fase 3 (calendario, lee bitácora)
Fase 1 (motor) ──┬───┘
                 └─→ Fase 2 (repurposing, usa el motor)
Fase 4 (playbook) ← se alimenta de la bitácora; es continuo, corre en paralelo
```

- **Fase 0** es liviana y arranca ya: deja midiendo desde la próxima pieza.
- **Fase 1** es la infraestructura grande (el mayor multiplicador). Va después.
- **Fase 2 y 3** se apoyan en 1 y 0.
- **Fase 4** no "termina": es el hábito que hace que la skill mejore sola.

Cada fase está partida en pasos de tamaño sesión. Si una fase se ve larga
para un solo bloque de trabajo, se corta y se sigue en la próxima.

---

## Fase 0 — Base + bitácora (medición)

**Objetivo:** empezar a medir qué funciona, sin lo cual todo lo demás es
adivinar. Es la recomendación #2, primero porque es barata y alimenta al
resto.

**Por qué hace crecer la comunidad:** deja de repartir esfuerzo parejo.
Ves qué forma/terreno/hook trae DMs concretos y signups, y duplicás eso.

**Pasos:**
1. Crear `references/bitacora.md` con una fila por pieza publicada.
   Columnas: fecha · pieza · forma (A-F) · terreno (1-5) · preset · hook ·
   formato (video/carrusel/corto) · vistas · retención % · guardados ·
   DMs (vagos / concretos) · signups · notas.
2. Definir el ritual: al publicar → agregar fila; a los 3-7 días →
   actualizar métricas. Documentarlo en `SKILL.md` (sección Medición).
3. Cargar las piezas ya publicadas que se recuerden, para tener base.

**Entregables:** `bitacora.md` + ritual documentado.
**Listo cuando:** existe la bitácora y hay al menos las piezas conocidas
cargadas.
**Depende de:** nada. **Tamaño:** 1 sesión corta.

---

## Fase 1 — Video desde datos (el motor) ✅

**Estado: COMPLETA (19-ago-2026).** Los 6 pasos, hechos. Producir un video es
editar un `.json` y correr `npm run nuevo -- guiones/<tema>.json`.

**Objetivo:** que producir un video sea llenar **un archivo de datos**, no
editar código. Recomendación #1.

**Por qué hace crecer la comunidad:** TikTok premia el volumen constante.
Si un video pasa de ~30 min a ~5, subís de 2 a 5+ por semana con la misma
calidad. Más piezas = más alcance = más gente al Skool. Es el mayor
multiplicador que queda.

**Pasos:**
1. Diseñar el esquema `guion.json`: `preset`, `portada` (tipo + contenido
   según amenaza/número/pregunta), `escenas[]` (cada una: kicker, layout,
   título, cuerpo, y opcionales ledger/tarea/asset), `handle`, `musica`.
2. Validar el esquema con `zod` (ya está `@remotion/zod-types` instalado),
   para que un JSON mal armado avise en vez de romper el render.
3. Crear un **renderer de escena** en Remotion que reciba datos y arme la
   escena mapeando `layout` → componente (Title/Body/Ledger/BigNumber/
   Quote ya existen; falta el que las ensambla desde datos).
4. Hacer que `Carrusel.tsx` lea las escenas del JSON (por `defaultProps` o
   `staticFile`) en vez de tenerlas hardcodeadas.
5. Script `nuevo-video.js guiones/<tema>.json` → renderiza el mp4.
6. Documentar en `references/video.md` + dejar un `guiones/cupones.json` de
   ejemplo (el contenido actual, migrado a datos).

**Entregables:** esquema + validación + renderer + 1 guion de ejemplo +
doc.
**Listo cuando:** cambiando solo el JSON sale un video nuevo, sin tocar
`.tsx`.
**Depende de:** nada (pero conviene después de Fase 0). **Tamaño:** 2-3
sesiones (es la pieza grande — se corta en: esquema, renderer, script).

---

## Fase 2 — Repurposing (1 insight → 4 formatos) ✅

**Estado: COMPLETA (19-ago-2026)** salvo el paso 4 (pegamento en el flujo).
Del mismo `guion.json` salen video, corto, carrusel y post de Skool.

**Objetivo:** que del mismo `guion.json` salgan **video + carrusel + corto
de 10s + post del Skool**. Recomendación #3.

**Por qué hace crecer la comunidad:** cuadruplicás la presencia sin
cuadruplicar el trabajo. Cada clase rinde 4 puertas de entrada en vez de 1.

**Pasos:**
1. ✅ Conectar el generador de carruseles (Pillow, `scripts/generar_carrusel.py`)
   al mismo `guion.json` — `carrusel_desde_guion(path)`, hecho 19-ago.
2. ✅ Derivar un **corto de 10s** — `src/Corto.tsx` + `--corto`, hecho 19-ago.
3. ✅ Derivar el **post del Skool** — `scripts/post_skool.py`, hecho 19-ago.
4. ⬜ Que al procesar una transcripción, la skill entregue el ángulo ganador
   en sus 4 formatos, más su descripción/hashtags (`publicacion.md`). (La
   maquinaria está; falta el pegamento en el flujo — se cierra con la próxima
   transcripción real.)

**Entregables:** flujo que de 1 `guion.json` produce 4 salidas.
**Listo cuando:** un insight se publica en 4 formatos sin rehacer contenido.
**Depende de:** Fase 1. **Tamaño:** 2 sesiones.

---

## Fase 3 — Calendario semanal con variedad forzada ✅

**Estado: COMPLETA (19-ago-2026).** `scripts/plan_semana.py` + disparador en
`SKILL.md`. Los 3 pasos, hechos.

**Objetivo:** un flujo "qué publico esta semana" que arma 4-5 piezas
balanceando las 6 formas, los 5 terrenos y los 4 presets, sin repetir
forma/preset seguidos. Recomendación #4.

**Por qué hace crecer la comunidad:** el crecimiento es cadencia
sostenida, no picos. Un sistema que dice qué grabar evita el bloqueo de
"¿qué subo hoy?" (lo que frenó proyectos antes) y garantiza que no te
vuelvas monótono.

**Pasos:**
1. ✅ Regla de mezcla semanal (de `formas.md`) codificada, con rotación
   C↔F y B↔E por semana.
2. ✅ `plan_semana.py` lee `bitacora.md` (qué rindió + última pieza) + los
   5 terrenos y propone el mix, marcando forma/preset/terreno/formato.
3. ✅ Salida en tabla (día · forma · terreno · preset · formato) + los
   recordatorios (formas caras, E intercalada, repurpose gratis).

**Entregables:** flujo de planificación semanal.
**Listo cuando:** pedir "plan de la semana" devuelve 4-5 piezas
balanceadas y accionables.
**Depende de:** Fase 0 (bitácora). **Tamaño:** 1-2 sesiones.

---

## Fase 4 — Playbook que aprende + stack vigente (continuo) 🟢

**Estado: ACTIVA (19-ago-2026).** Infraestructura montada (pasos 1-3);
ahora es un hábito que se alimenta de la bitácora.

**Objetivo:** que la skill guarde sus **ganadores** y se mantenga
actualizada. Recomendación #5. No "termina": es el hábito que la hace
mejorar sola.

**Por qué hace crecer la comunidad:** cada mes mejor que el anterior
porque acumula lo que funcionó. TikTok cambia rápido; una skill que no se
actualiza pierde vigencia en meses.

**Pasos:**
1. ✅ Creado `references/ganadores.md` (hooks/sonidos/CTAs/recursos con su
   métrica) — 19-ago. Con candidatos en observación cargados.
2. ✅ Cableado en `SKILL.md`: consultar `ganadores.md` antes de proponer
   hooks (paso 6 de procesar transcripción + sección Playbook).
3. ✅ Revisión trimestral del stack: tabla en `ganadores.md` con la línea
   base (Remotion 4.0.513) — próxima revisión ~nov-2026.

**Entregables:** `ganadores.md` vivo + recordatorio trimestral.
**Listo cuando:** es un hábito — cada pieza ganadora se registra y se
reusa.
**Depende de:** Fase 0. **Tamaño:** continuo (arranca en 1 sesión corta).

---

## Cómo trabajamos cada fase

- **Un paso concreto por vez.** Nada de gates ni ceremonia; se avanza y se
  muestra.
- **Verificación con los ojos:** cuando el cambio es visible, se renderiza
  un test y se mira antes de dar por hecho.
- **Cerrar actualizando este archivo:** el último paso de cada sesión es
  mover casilleros en "Estado actual" y dejar escrito "dónde quedamos".
- **Avisar del techo:** si una fase se ve larga para una sola sesión, se
  corta antes de empezar.

## Ideas para más adelante (backlog)

No entran en las 5 fases, pero valen para cuando toque:
- **Fase 6 — Video principal con footage propio (LA gran meta, DIRECCIÓN
  DEFINIDA 19-ago).** PIVOTE: el video principal ya NO es el automático de
  placas (ese pasa a ser opcional/fallback y sigue alimentando el carrusel).
  Ahora el video principal es **el usuario hablando a cámara**, editado, y es el
  único que se edita como tal. Estilo elegido: **"Vos + placas de refuerzo"** —
  su footage con subtítulos animados + las placas gráficas (gancho, -20%,
  tarea, reusando los componentes de `scenes.tsx`/`Escena.tsx`) superpuestas en
  los momentos clave + elementos de marca flotando (ver `FloatDemo.tsx`, versión
  pro sin emojis) + intro IA con su cara + CTA final visual. Meta: nivel editor
  pro +10 años [[calidad-sobre-velocidad]]; render puede tardar (hasta ~15 min).
  Piezas a construir: (a) template `VideoHablado` que importe su mp4
  (`OffthreadVideo` desde `grabaciones/<tema>.mp4`), lo recorte y le superponga
  capas (placas por timestamp, subtítulos, flotantes, CTA); (b) subtítulos
  automáticos = transcribir su audio (Whisper/Gemini) → `@remotion/captions`;
  (c) carrusel con imágenes Gemini de su cara por slide; (d) teleprompter: el
  guion de grabación (`references/guion-grabacion.md`) sale junto al guion.
  Carpetas listas: `grabaciones/` (su video) y `referencias/` (sus fotos).

  **AVANCE 20-ago (probado con footage real del usuario):**
  - ✅ `src/VideoHablado.tsx`: intro (cara IA) → su footage con efectos de cámara
    (zoom lento + punch) → CTA. `calculateMetadata` deriva duración de
    `footageFrames` (así el corto por `--props` recorta bien).
  - ✅ Subtítulos automáticos: `scripts/transcribir.mjs` (whisper.cpp local,
    GRATIS; modelo `base` bajado en `whisper.cpp/`), `src/Subtitulos.tsx` estilo
    TikTok con bloque `SUBS` de ajustes rápidos (BOTTOM/FONT/PALABRAS_MS/ESTILO;
    default "limpio", tercio inferior para no tapar la cara). Los tokens se unen
    en palabras completas. Captions → `guiones/<tema>.captions.json` (editable
    para corregir errores de whisper, ej. "margen"→"margin"). Plan B
    `scripts/transcribir-gemini.mjs` (no usado; whisper anduvo).
  - ✅ Corto de footage: `remotion render VideoHablado --props` con footageFrames
    corto + sin intro. Carrusel (marca) y post ya salían del guion.
  - Footage debe estar en `public/grabaciones/` para que Remotion lo sirva
    (`grabaciones/` raíz es donde lo deja el usuario; se copia a public).
  - Instalados: `@remotion/install-whisper-cpp`, `@remotion/captions`.

  **AVANCE 20-ago (bloque 2):**
  - ✅ **Animaciones sincronizadas con la voz** (`construirCallouts` + `Callout`
    en `VideoHablado.tsx`): placas de marca (-10%, -20%, PROMOCIÓN, CUPÓN, DE TU
    BOLSILLO, LINK EN BIO) aparecen en los momentos que se dicen esas palabras
    (usa `startMs` de los captions). Arrancan después del título gancho (~5.5s),
    espaciadas ≥1.4s, posiciones que evitan la cara y los subtítulos.
  - ✅ **Panel de controles en español** en Studio: `videoHabladoSchema` (zod v4,
    que Remotion 4.0.513 sí soporta) con grupo `textos` (tituloArriba, tituloAbajo,
    placa, alturaSubtitulos=subir/bajar, tamanoLetra, estiloSubtitulos) + `.describe()`.
    Verificado en el navegador. Los subtítulos se pasan como ARCHIVO
    (`captionsFile`, servido de `public/captions/`), NO como lista en props —
    eso rompía el SchemaEditor. Guardar-a-código no funciona (defaultProps no
    extraíble); se usa el botón Render o se fijan valores en `TEXTOS_DEFAULT`.
  - ✅ Subtítulos corregidos (margen/cupón/VENDÉS) — son editables en el .json.
  - ✅ **Comando único `npm run todo -- guiones/<tema>.json`** (`scripts/todo.mjs`):
    video hablado + corto + carrusel + post + descripción, de una.

  **AVANCE 20-ago (bloque 3 — pulido pro):**
  - ✅ **Objetos 3D de marca** (`scripts/generar-objetos.mjs` + `quitar-fondo.py`):
    biblioteca de 11 objetos 3D vibrantes (azul/amarillo, fondo transparente,
    Gemini) que aparecen flotando sincronizados con la voz vía el sistema de
    callouts. Prioridad Lottie → objeto 3D → ícono vector → texto. Se generan
    una vez y se reusan. (Descartada la versión foto-realista: quedó opaca.)
  - ✅ **Cámara virtual variable** (`src/camara.ts`): reemplaza el zoom fijo.
    6 movimientos (acercar/alejar/paneo L-R/deriva/tilt) encadenados por
    segmentos, con secuencia distinta por video (semilla = nombre del footage)
    + golpes de zoom sincronizados a los objetos. Control `estiloCamara` en el
    panel (auto/reposado/dinamico/agresivo). Overscan limitado (sin bordes negros).
  - ✅ **Subtítulos arreglados**: se pegaban al agrandar la palabra activa;
    ahora contenedor flex con gap real + énfasis solo por color amarillo (look
    limpio de tendencia). Verificado en resolución real.
  - ✅ **(a) Carrusel con TU cara** — HECHO. `scripts/carrusel-rostro.mjs` genera
    portada + cierre en contexto (Gemini + fotos de `referencias/`, 9:16);
    `generar_carrusel.py` las compone con `_photo_bg` (recorte 9:16 + tinte navy
    + degradado) y texto con sombra. Las slides de datos quedan limpias (a
    propósito). Enchufado a `todo.mjs` (se salta si ya existe → no regasta tokens).

  **AVANCE 20-ago (bloque 4 — cierre de pendientes):**
  - ✅ **(b) Teleprompter** — `scripts/teleprompter.py`: deriva del guion el
    TEXTO A CÁMARA (gancho filtra → valor sin vender → CTA visual) siguiendo
    `references/guion-grabacion.md`, con conteo de palabras y aviso si pasa de
    ~85 (target 20-30s). Override manual con bloque `grabacion` en el guion.
    **Comando pre-grabación `npm run libreto -- guiones/<tema>.json`**
    (`scripts/libreto.mjs`): lo imprime en pantalla ANTES de grabar (no necesita
    el video). Corrige el orden real del flujo: transcripción → Claude arma el
    guion → `npm run libreto` (leés y grabás) → `npm run todo` (arma el resto).
    También sale dentro de `todo.mjs`.
  - ✅ **(c) Whisper `small`** ya era el default de `transcribir.mjs` (modelo
    bajado); la nota anterior estaba vieja. Subtítulos con mejor precisión.
  - ✅ **(d) Ajustes del panel persistidos** — bloque `video` en el guion
    (alturaSubtitulos, tamanoLetra, estiloSubtitulos, estiloCamara, títulos,
    placa). `producir-hablado.mjs` los mergea sobre los defaults y los pasa al
    render. Helper `scripts/ajustar-video.mjs` los escribe desde la terminal
    (ej. `--camara agresivo --subs-altura 340`). Lo que probás en Studio se
    guarda como dato, no se pierde.

  **AVANCE 20-ago (bloque 5):**
  - ✅ **(f) CTA final VISUAL** — `CTACaptura` en `VideoHablado.tsx`: si dejás
    `public/capturas/<tema>.png`, el cierre muestra la captura enmarcada con una
    flecha que rebota + anillo que pulsa apuntando al target (regla de
    guion-grabacion.md). Fallback automático a la tarjeta de texto si no hay
    captura (ambos verificados con stills). Target ajustable por guion
    (`capturaTargetX/Y`) o `ajustar-video.mjs --cta-x --cta-y`.
    Instrucciones en `public/capturas/LEEME.md`.

  **AVANCE 21-ago (bloque 6 — orden total por tema + multi-clip):**
  - ✅ **Estructura por tema**: cada contenido vive en `temas/<tema>/` con su
    `<tema>.json` (guion), `grabaciones/` (1 o varios clips) y `capturas/`
    (CTA opcional). Los subtítulos quedan en `temas/<tema>/<tema>.captions.json`.
    `referencias/` (cara) y `public/objetos/` (3D) quedan GLOBALES (compartidos).
    Salida: `out/<tema>/`. Resolvedor `scripts/lib-tema.mjs` acepta nombre
    (`cupones`), carpeta o ruta al json. Comandos ahora por nombre:
    `npm run todo -- cupones`, `npm run libreto -- cupones`,
    `node scripts/ajustar-video.mjs cupones ...`.
  - ✅ **Varios clips con transiciones pro**: `scripts/lib-video.mjs`
    (`combinarClips`) une los clips de `grabaciones/` en orden con xfade
    (smoothleft/circleopen/… rotando, 0.35s) + acrossfade de audio, normalizando
    a 1080x1920/30fps. Usa **ffmpeg del sistema** (el de Remotion no soporta
    `-filter_complex`); si falta, avisa (`brew install ffmpeg`) y usa el 1er clip.
    1 clip = copia directa (sin recomprimir). Verificado: 3 clips → 34.6s OK.
  - Migrado cupones a `temas/cupones/`. `src/Corto.tsx` y `src/Carrusel.tsx`
    ahora importan `../temas/cupones/cupones.json`.
  - `MANUAL.md` + guía visual (artifact) actualizados a la estructura por tema.

  **FALTA de Fase 6:** (e) opcional: animaciones Lottie reales (componente
  cableado, faltan `.json` en `public/lottie/` — los objetos 3D ya cubren la
  necesidad). Todo lo demás de Fase 6 está HECHO. Uso: `npm run todo -- <tema>`.
- **Fase 7 — Motor de ideas (para no parar nunca) — ARRANCADA 21-ago.**
  Depósito de conocimiento que solo crece + backlog que aprende:
  - ✅ `biblioteca/` (carpeta): el usuario tira TODAS las transcripciones de
    clases/preguntas/comentarios; una fuente por archivo. Solo crece.
  - ✅ `banco-de-ideas.md`: backlog vivo de ángulos con estado (idea →
    produccion → publicado). Nunca repite un ángulo publicado.
  - ✅ `references/angulos.md`: matriz de multiplicación (1 tema → 8-10 ángulos:
    error/mecanismo/cálculo/mito/categoría/caso/comparación/objeción…) + fuentes
    que se renuevan solas (comentarios, cambios de ML, resultados, estacional).
  - ✅ `scripts/estado-contenido.mjs` (`npm run estado`): tablero — fuentes
    cargadas, temas producidos, ideas por estado, potencial estimado (~fuentes×9).
  - ✅ `SKILL.md` cableado: al pedir ideas, la skill lee biblioteca/ + temas/ +
    banco + bitacora + ganadores, multiplica ángulos, NO repite, prioriza lo que
    convirtió, y anota las ideas nuevas en el banco.
  - FALTA (uso): cargar transcripciones reales en `biblioteca/` y correr la
    primera ronda de ideación para llenar el banco.
- **Fase 8 — Empaquetado para el equipo (GitHub) — HECHO 21-ago.**
  Paquete en `paquete-github/` (repo git local, 1er commit, 97 archivos, 0 claves):
  `README.md`, `instalar.sh` + `instalar.command` (doble-clic Mac), `.gitignore`
  (ignora .env, fotos, node_modules, whisper, out), `contenido/` (la skill con
  `video-template/`). El instalador chequea node/python/ffmpeg, copia la skill a
  `~/.claude/skills/contenido`, crea la carpeta de trabajo, `npm install` +
  Pillow, y `.env` vacío. **Onboarding por chat** (en `SKILL.md`): exige fotos
  primero, cada persona pone SU clave de Gemini (cobro propio), y la skill crea
  los `.txt` de biblioteca por ellos (no arman archivos). Objetos 3D incluidos
  (no los regeneran). Guion de ejemplo en `temas/cupones/cupones.json`.
  Seguridad: se detectó y eliminó un `.env.example` viejo con la clave real
  (del template y del paquete); nunca se publicó.
  FALTA (usuario): crear el repo en GitHub y `git push`.
- Distribución del mismo render a **Reels y Shorts** (cross-posting).
- **Contenido de miembros** (resultados reales como prueba social).
- **A/B de hooks**: dos portadas del mismo tema, medir cuál retiene.
