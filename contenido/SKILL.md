---
name: contenido
description: Convierte transcripciones de clases de la comunidad Easy Meli en contenido de TikTok (guiones de video y carruseles) bajo el ángulo "por qué funciona", nunca tutorial. Úsala siempre que alguien suba una transcripción de clase, pida ideas de contenido, guiones, hooks o carruseles para el nicho de MercadoLibre, o pregunte qué publicar esta semana — aunque no mencione la palabra "skill" ni nombre a Easy Meli explícitamente.
---

# Contenido Easy Meli

Easy Meli es una comunidad de Skool que enseña a vender en MercadoLibre
en Chile. El contenido de TikTok es el canal de captación: videos
orgánicos que llevan gente a la comunidad.

Tu trabajo con esta skill es sacar contenido publicable de las
transcripciones de las clases en vivo.

## La regla que define todo

**Explica POR QUÉ funciona algo, nunca CÓMO hacerlo.**

El contenido "cómo hacer" convierte el canal en biblioteca gratis: la
gente resuelve su duda puntual y se va. El "por qué funciona" deja al
espectador entendiendo el mecanismo pero sin la ejecución, y ese hueco
es lo que empuja hacia la comunidad.

El filtro práctico: si el video se puede ejecutar apenas termina de
verlo, es tutorial y está mal. Si al terminar la persona entiende algo
pero todavía no sabe qué hacer con eso, está bien.

Esto también significa que el paso a paso de cualquier trámite o
interfaz queda fuera. Además de ser tutorial, es lo primero que se
desactualiza cuando MercadoLibre cambia el panel.

## Onboarding — revísalo SIEMPRE antes de crear contenido

**Regla de lenguaje:** háblale a la persona en español neutro con **"tú"**,
nunca "vos" ni voseo (nada de "grabá/poné/mandame/tenés"; usa
"graba/pon/mándame/tienes"). El usuario no es argentino.

La gente del equipo NO arma archivos ni edita carpetas a mano. Tú lo haces por
ellos desde el chat. Cuando alguien use esta skill, verifica el setup en este
orden y **no avances hasta completarlo**:

1. **Las 5 fotos de la cara — OBLIGATORIO, gate duro, va primero.** Cuenta las
   imágenes en `referencias/` (ignora el LEEME). La regla es **5 fotos: si hay
   menos de 5, NO se avanza a NADA** (ni clave, ni contenido). Pídelas así, en tú:
   > "El personaje de tus videos vas a ser tú, así que necesito **5 fotos tuyas**:
   > una de frente, una de tres cuartos (girado ~45°), una de perfil, y dos más
   > con distintas expresiones o ángulos. Buena luz, cara despejada, sin lentes de sol."

   **Nombres de las fotos** (para que quede bien registrado, en este orden):
   `01-frente`, `02-tres-cuartos`, `03-perfil`, `04-sonriendo`, `05-serio`. Si la
   persona te las adjunta en el chat, **guárdalas tú con esos nombres** en
   `referencias/` — ella no necesita nombrarlas. Si no puedes acceder al archivo
   adjunto, dile que las arrastre a `referencias/` con esos nombres. (El nombre
   ayuda al orden pero no es imprescindible para que funcione: si no lo pones, no
   pasa nada.)

   Si llegan **menos de 5**, di cuántas faltan y pídelas antes de continuar. Sin
   las 5, no se produce nada.

2. **Su PROPIA clave de Gemini — OBLIGATORIO (la guardas tú, con cuidado).** Si
   `GEMINI_API_KEY` en `.env` está vacío, pídesela en tú, sin mandarla a abrir
   ningún archivo:
   > "Pégame aquí tu clave de Gemini (la sacas en aistudio.google.com/apikey, con
   > tu facturación). Es tuya y el cobro es tuyo. Yo la guardo y no la muestro."

   Cuando la pegue, **escríbela tú en `.env`** (`GEMINI_API_KEY=<clave>`) con
   estas reglas de seguridad **estrictas**:
   - **Nunca la repitas** en tus respuestas ni la muestres en la salida de ningún
     comando. Escríbela con un método que NO la imprima (no `echo <clave>`; usa un
     Write directo a `.env` o un heredoc que no la eche a pantalla).
   - **No la dejes en ningún otro lado:** ni logs, ni temporales, ni scratchpad,
     ni props. Solo en `.env` (que ya está en `.gitignore`).
   - Confirma con **exactamente** este mensaje, nada más:
     "Listo, guardé tu clave en .env. No la muestro por seguridad."
   - Cada persona usa SU clave — el cobro es de ella. Nunca reutilices una clave
     ajena ni la de otro proyecto.

3. **Su ADN de voz — OBLIGATORIO, con EVALUACIÓN de voz (gate duro).** Comprueba
   `Mi-ADN-VOZ/voice-dna.json`. Si no existe, o existe con
   `validado_por_la_persona: false`, **NO avances a nada** (ni biblioteca, ni
   producir). Haz la evaluación en el orden de `Mi-ADN-VOZ/SKILL.md`:
   **primero** lee TODAS sus conversaciones (`node scripts/extraer-voz.mjs`) y
   preséntale un borrador ("esto es lo que tengo a simple vista"); **luego**
   afínalo con la entrevista guiada (roleplay de venta + su historia + cómo
   enseña); **al final** muestra 3 frases de ejemplo y valida. Solo con
   `validado_por_la_persona: true` se avanza. Obligatorio para **cada** integrante
   del equipo: cada uno hace su propia evaluación para tener su propia voz.

4. **Objetos 3D (una vez).** Si `public/objetos/` está vacío, corre
   `node scripts/generar-objetos.mjs` una vez (usa la clave de la persona).

5. **Dependencias.** Si algún comando falla por falta de algo (node, Pillow,
   ffmpeg), dile el comando exacto para instalarlo (ver `README.md` del paquete).
   ffmpeg solo hace falta para unir varios clips.

## Crear el archivo de biblioteca por ellos

La gente NO crea los `.txt` de la biblioteca. El flujo es siempre (en tú):

1. Pídele: **"Mándame el contenido (la transcripción o el tema) que quieres meter
   en la biblioteca."**
2. Cuando lo mande, **tú creas el archivo** `biblioteca/<tema>.txt` con ese
   contenido (nombre en minúsculas y con guiones, por el tema).
3. Ahí arranca solo el proceso: lees esa fuente, sacas los ángulos
   (`references/angulos.md`), y sigues con la creación del contenido (guion en
   `temas/<tema>/<tema>.json`, libreto, etc.), sin pedirle que toque carpetas.

## Objetos 3D por tema (pregúntalo en CADA video)

Los objetos que flotan en el video NO tienen que ser los mismos para todos: cada
tema puede tener los suyos, relacionados con lo que se habla.

**Los objetos generados quedan guardados** en `public/objetos/` y se pueden
**reusar en cualquier video futuro** — una vez generado, no se paga ni se genera
de nuevo. Por eso, **en cada video nuevo, pregunta** en tú (mira primero qué hay
en `public/objetos/` para ofrecerlo):
> "Para los objetos que aparecen en el video, ¿qué prefieres?
> 1) **Reusar** los que ya tienes guardados (tienes: cupón, billete, camión, …).
> 2) **Generar nuevos** para este tema (~US$0,03 cada uno, con tu clave).
> 3) **Pasarme objetos tuyos** (si tienes imágenes que quieres usar, mándamelas).
>    Tienen que venir SÍ o SÍ en **PNG con fondo transparente** y en **800×800 px**
>    (cuadrado). En Canva es fácil: crea un diseño de **800×800 px**, pon el
>    objeto, quítale el fondo con **Editar imagen → Quitar fondo**, y descárgalo
>    como **PNG** con la casilla **'Fondo transparente' activada**."

Según lo que elija:
- **Reusar:** arma las `reglas` del guion apuntando a los `.png` que ya existen
  en `public/objetos/`. No se genera nada.
- **Generar nuevos:** declara en el `<tema>.json` → `"objetos"`:
  `{ "<nombre>": "descripción para Gemini" }` (el pack) y `"reglas"`:
  `[{ "palabras": "reloj|tiempo", "objeto": "reloj.png", "label": "TIEMPO" }]`
  (cuándo aparece cada uno). `producir-hablado` genera el que falte y los conecta.
- **Objetos propios:** EXIGE que vengan en **PNG con fondo transparente, 800×800
  px**. Si mandan un objeto con fondo (blanco/color), NO lo uses así: recuérdale
  que en Canva lo deje transparente (Editar imagen → Quitar fondo → descargar PNG
  con 'Fondo transparente'), o pásalo por `scripts/quitar-fondo.py` solo si el
  fondo es liso. Guárdalos en `public/objetos/<nombre>.png` y arma las `reglas`
  que las disparan.

En todos los casos, los objetos del tema aparecen sincronizados con esas
palabras, **además** de los genéricos de marca.

## Variedad de efectos (que los videos NO se vean iguales)

Regla firme: **nunca dos videos seguidos con el mismo combo de efectos.** Si
todos usan lo mismo, el canal se ve repetitivo. Ya varían solos: la cámara en
`auto` arma una secuencia distinta por video (según el nombre del tema) y la
entrada de los objetos rota (pop / izquierda / derecha / giro). Encima de eso,
al armar el bloque `video` del guion, **alterna a propósito** respecto al video
anterior:
- `estiloCamara`: elige según el tono — `agresivo` para alerta/error, `dinamico`
  para temas con energía, `reposado` para explicativos — y no repitas el mismo
  dos veces seguidas.
- `estiloSubtitulos`: alterna `limpio` / `resaltado` entre videos.
- **Objetos distintos por tema** (sección de arriba): cada tema, los suyos.

Es el mismo principio que el calendario (no repetir forma dos veces seguidas):
cada video tiene que sentirse distinto del anterior.

## La voz de la persona (Mi-ADN-VOZ) — parte OBLIGATORIA del proyecto

El proyecto incluye el módulo **`Mi-ADN-VOZ/`** (viene con la instalación, no es
opcional): captura el perfil de voz de escritura de la persona y lo guarda en
`Mi-ADN-VOZ/voice-dna.json`. Todo el sistema trabaja con él.

- **Es un requisito, no un extra.** Si `Mi-ADN-VOZ/voice-dna.json` no existe, se
  captura en el onboarding (paso 3) antes de producir. Sin ADN de voz, no se
  produce contenido.
- **Al escribir CUALQUIER texto** (guion, libreto, post de Skool, descripción):
  **aplica siempre** el perfil — usa sus frases firma, su tono y su energía;
  respeta `never_say` y `words_to_avoid`. Así el contenido suena a la persona, no
  a IA genérica.
- Para **actualizar** la voz (si su estilo cambió), se repite el proceso de
  `Mi-ADN-VOZ/SKILL.md` y se regenera el JSON.

Lo mismo con las **capturas** del cierre: si manda una, la guardas tú en
`temas/<tema>/capturas/`.

## Cómo procesar una transcripción

1. Busca momentos donde alguien explica un mecanismo, no un
   procedimiento. "Por qué el algoritmo hace esto" sirve; "dónde hay
   que hacer clic" no.
2. Busca casos reales con números, nombres de cuentas o capturas
   posibles. Son lo más valioso y lo que nadie más en el nicho tiene.
3. Busca contrastes: dos vendedores en la misma situación con
   resultados opuestos. Es la mejor materia prima que existe.
4. Busca las preguntas que hace la gente en vivo. Son dudas reales,
   no temas imaginados.
5. Descarta lo que está en "Qué nunca se publica" (abajo).
6. **Antes de proponer hooks/CTAs, consulta `references/ganadores.md`**: si
   algo que ya convirtió aplica al tema, reúsalo o haz una variante en vez
   de arrancar de cero.

Entrega una lista de ángulos, no guiones, salvo que los pidan. Para
cada ángulo: el mecanismo en una línea y de dónde sale.

## Ideación desde la biblioteca (para no quedarse sin temas)

El proyecto tiene una **biblioteca** (`biblioteca/` en video-remotion): una
carpeta donde el usuario va acumulando TODAS las transcripciones de clases,
preguntas de la comunidad, comentarios, cambios de MercadoLibre, etc. Solo
crece. De ahí sale el contenido para no parar nunca.

Cuando el usuario pida **ideas** ("dame ideas de contenido", "qué grabo esta
semana", "ya no tengo temas"):

1. **Lee todo** lo que haya en `biblioteca/` (cada archivo es una fuente).
2. **Multiplicá cada tema en ángulos** con `references/angulos.md` (una clase =
   8-10 piezas: error, mecanismo, cálculo, mito, categoría, caso, comparación,
   objeción…).
3. **No repitas.** Cruzá contra `banco-de-ideas.md` (lo ya anotado/publicado) y
   contra las carpetas de `temas/` (lo ya producido). Descartá lo que ya salió.
4. **Prioriza por lo que convierte:** mira `references/bitacora.md` y
   `references/ganadores.md`; inclina la tanda hacia el tipo de ángulo/forma que
   ya retuvo o trajo signups.
5. **Balanceá la variedad** con las 6 formas (no dos iguales seguidas).
6. **Anota las ideas nuevas** en `banco-de-ideas.md` (estado `idea`), una fila
   por ángulo, con su gancho semilla y de qué fuente sale.

Si la biblioteca se siente "cubierta", suma fuentes que se renuevan solas
(comentarios/DMs, cambios de ML, resultados de miembros, objeciones,
estacional) — están listadas en `angulos.md`. El contenido no se agota: cada
fuente se multiplica y entran fuentes nuevas.

El usuario ve la foto con `npm run estado` (cuántas fuentes cargadas, temas
producidos, ideas pendientes y potencial estimado).

## Las seis formas

Cada idea se escribe en una de estas formas. La forma decide el hook y
el cierre. Nunca dos videos seguidos con la misma forma — ahí está la
variedad que hace sostenible publicar seguido.

**A. Te está pasando y no lo sabes** — hay un daño ya en curso, el
espectador se revisa mientras mira. Hook en segunda persona, en pasado.

**B. Lo que parece inteligente y no lo es** — una decisión razonable con
consecuencia invertida. El hook valida primero y desarma después.

**C. Dos casos, mismo escenario, final distinto** — una sola variable de
diferencia. La que mejor retiene. Requiere pantalla o capturas.

**D. El número que nadie te dice** — abre con la cifra, seco, sin
adorno. La más barata de producir.

**E. Por qué el sistema es así** — el incentivo detrás de la regla. La
más "profesor" del set; úsala poco.

**F. Me pasó a mí** — historia propia, sin guion rígido. El tono natural
rinde más que el texto escrito. Son limitadas: no se fabrican.

Las formas A, B, C y F retienen mejor. La E es la más débil.

Detalle en `references/formas.md`.

## Reglas de guion

- 35 segundos. Un video de 49s dejó al 82% sin escuchar el cierre.
- El cierre va alrededor del segundo 25, no al final.
- Estructura: hook, desarrollo, cierre. Nada más.
- Tuteo chileno-venezolano. Nunca voseo argentino: nada de "vos",
  "tenés", "podés", "querés", "sos".
- "Plata" y "acá" sirven; son neutros para audiencia chilena y
  venezolana.
- El hook funciona sin contexto previo. Nada de saludos antes.

## CTA y captación

CTA en uno de cada cuatro videos como máximo. Los demás cierran dejando
la ejecución como tema aparte, sin ofrecer nada.

Cuando haya CTA, prefiere darle una tarea antes que pedirle algo:
"anda a INAPI y fíjate qué clase te pusieron" funciona mejor que
"escríbeme". El que hace la tarea y descubre el problema escribe solo,
y llega con un diagnóstico en vez de una curiosidad vaga.

Nunca uses escasez fabricada — cupos limitados, cierra el jueves. Rompe
la posición de operador que sostiene todo lo demás.

Para mencionar la comunidad sin venderla:
- Cuenta de dónde salió lo que explicas ("esto se lo debo a Anthony,
  que vive metido en catálogos").
- Muestra el resultado de otra persona, no el propio. El resultado
  ajeno se lee como prueba; el propio como marketing.
- Regala algo que era interno ("el otro día me preguntaron esto en una
  clase").

Nunca describas a nadie como "miembro de mi comunidad". Di "un amigo".

Cada pieza sube con su descripción y hashtags — genéralos junto con el
video, no aparte. Fórmula (hook nuevo → mecanismo → tarea → pregunta) y
estrategia de hashtags (nicho primero, sin hashtags de IA) en
`references/publicacion.md`.

## Qué nunca se publica

- Trucos que manipulan el sistema (reseñas infladas, cupones que
  fuerzan cinco estrellas). Además del riesgo de que MercadoLibre
  cierre el hueco, marca al canal como el que enseña a burlar.
- Cualquier cosa que exponga a un miembro de la comunidad — errores
  suyos, cuentas identificables, prácticas dudosas que contaron en
  confianza.
- Contenido que se pidió expresamente dejar fuera de grabación.
- Flujos de herramientas de IA. Mueven el algoritmo hacia audiencia de
  IA en vez de vendedores.
- Paso a paso de trámites o interfaces.
- Datos en pesos que se reajustan (usa UTM). Los montos fijos quedan
  obsoletos y alguien los corrige en comentarios.

Si citas cifras de terceros (agencias, consultores), ten la fuente a
mano para comentarios, pero no la pongas en la pieza: en formato corto
la atribución le quita fuerza.

## Carruseles

Funcionan para las formas C y D. No para F: las historias sin voz
pierden la mitad.

En carrusel el copy largo sí funciona — suma tiempo de permanencia. Lo
que no puede hacer es repetir las slides; tiene que agregar. Cierra el
copy con una pregunta directa, que es lo que desbloquea comentarios.

Cinco o seis slides. La slide 1 es la portada y no explica: frena. El
gancho se juega en la miniatura del feed, no en la imagen grande. La que
mejor para el scroll es la amenaza en 2ª persona ("estás regalando un 20%
y no lo sabes"), un solo foco y un solo amarillo — no un número de promo,
que se scrollea. La matemática y el desarrollo van en las slides de
adentro.

Sistema visual (paleta navy + logo real de la comunidad como marca) y
script generador reutilizable en `references/carruseles.md`.

Los carruseles también se producen como **video vertical animado**
(más retención que las imágenes fijas). Plantilla Remotion reutilizable
en `video-template/` y flujo documentado en `references/video.md`:
duración por lectura, recorte de copy, efectos de sonido, y por qué el
sonido trending se agrega dentro de TikTok y no se quema en el video.

## Medición

Lo único que importa no es cuántos mensajes llegan — siempre llegan.
Es qué tipo:

- Vago ("quiero aprender a vender en MercadoLibre") → no califica.
- Concreto ("tengo mi marca pero creo que me pusieron la clase 35") →
  ese compra.

La proporción entre los dos dice si el contenido está calificando o
solo informando. Cuando alguien escriba, pregúntale qué video vio:
resuelve la atribución y abre mejor la conversación.

Benchmark actual de referencia: ~5.000 vistas orgánicas, 39% de
retención promedio, alta tasa de guardados y compartidos.

Cada pieza publicada se registra en `references/bitacora.md`: al publicar
se agrega la fila (forma, terreno, preset, hook), y a los 3-7 días se
completan las métricas y los DMs por tipo (vagos vs. concretos). Con
~15-20 filas se ven los patrones de qué produce más para duplicarlo. Es
la base para decidir qué contenido hacer, no adivinar.

## Clip intro con imagen IA

Al armar un `guion.json`, escribe también `intro.prompt`: un prompt para generar
una imagen impactante que abre el video como **clip introductorio animado**
(zoom/drift/luz) antes de la portada — sube la retención en el primer segundo.
Sigue la **receta del prompt** de `references/video.md`: una **escena** con un
sujeto y profundidad que anime bien (persona/objeto/situación, ej. un vendedor
de noche aplicando el panel de promociones sin darse cuenta), navy `#0A162E` +
amarillo `#FFC400`, 9:16, y **sin texto/letras/números/logos** en la imagen.
Pon `archivo: "ai/<nombre>-intro.png"`. El usuario genera la imagen con
`node scripts/generar-imagen.mjs guiones/<tema>.json` (clave de Google AI Studio
en `GEMINI_API_KEY`) y luego renderiza normal. Es opcional: sin imagen, el video
arranca directo en la portada.

**Tu cara (marca personal):** si el usuario quiere aparecer él en la escena,
pon `intro.persona: true` y describe la escena en 3ª persona neutra ("La
persona…"). El generador adjunta las fotos de `referencias/` para mantener su
cara consistente entre videos. Las fotos son privadas (gitignoreadas).

## Playbook: lo que ya funcionó

`references/ganadores.md` guarda hooks, sonidos, CTAs y recursos visuales
que convirtieron, cada uno con la métrica que lo respalda (sale de la
bitácora, no de corazonadas). **Consultalo antes de proponer un hook nuevo.**
Cuando una fila de la bitácora demuestre que algo pegó (retención alta,
guardados, DMs concretos, signups), subilo ahí. Incluye la revisión
trimestral del stack (Remotion, formatos de TikTok, tendencias) para que la
skill no se quede vieja.

## Reparto de trabajo (creativo vs. mecánico)

Claude hace lo **creativo** (cuesta tokens, se hace una vez por clase): elegir el
ángulo y escribir el `guiones/<tema>.json` completo — contenido, `intro.prompt`,
y `publicacion` (descripción + hashtags). Después el usuario dispara lo
**mecánico** con UN comando que NO gasta tokens de Claude:
`npm run producir -- guiones/<tema>.json` → imagen (Gemini, solo si falta) +
video + corto + carrusel + post + `<tema>-tiktok.txt`. Al entregar un guion
nuevo, recordале este comando. Piezas sueltas: `npm run nuevo` / `--corto` /
scripts python. Detalle en `scripts/producir.mjs` y `references/COMO-USARLA.md`.

## Guion de grabación (video hablado por el usuario)

Cuando el usuario va a grabarse él (su estudio) sobre una clase, entrega el
**guion de grabación** siguiendo `references/guion-grabacion.md`: estructura de
3 etapas (gancho que filtra al cliente ideal + micro-CTA / valor "vender sin
vender" / CTA final visual). Devolvé el título gancho (texto en pantalla ~6s),
la frase gancho hablada, el micro-CTA, el bloque de valor (mecanismo, "por qué
funciona"), y el CTA final visual (captura + flecha al Skool). Es el texto que
él lee a cámara, y calza con la edición en Remotion (título en pantalla,
subtítulos, elementos de marca flotando, resalte en el CTA). Meta de calidad:
edición nivel profesional de +10 años; el render puede tardar (hasta ~15 min),
la prioridad es la calidad, nunca recursos básicos ni emojis genéricos.

## Plan de la semana

Cuando pregunten "qué publico esta semana" (o pidan el calendario/plan),
corre `python3 scripts/plan_semana.py`. Arma 4-5 piezas balanceando las
6 formas, los 5 terrenos y los 4 presets, **sin repetir forma ni preset
en días seguidos**, y rota C↔F y B↔E por semana para no quemar las formas
caras (C, F) ni abusar de la débil (E). Lee `bitacora.md` para no arrancar
con la forma/preset de la última pieza y para priorizar lo que ya trajo
DMs concretos/signups. Devuelve una tabla (día · forma · terreno · preset
· formato) lista para producir, con recordatorios. La última pieza suele
marcarse como **repurpose** (gratis) de otra vía Fase 2. El objetivo es
matar el "¿qué subo hoy?" y sostener cadencia sin volverse monótono.

## Contexto de la comunidad

Quién es quién en las clases, los cinco terrenos donde cae todo el
material acumulado, y qué buscar en cada transcripción nueva:
`references/contexto.md`. Léelo antes de procesar una transcripción
por primera vez.

## Evolución de la skill

El plan de trabajo para escalar la skill (5 fases: bitácora, video desde
datos, repurposing, calendario semanal, playbook que aprende) vive en
`ROADMAP.md`. Es un documento vivo: al retomar el trabajo de evolución de
la skill, léelo primero para saber en qué fase vamos, y al cerrar una
sesión con avance, actualiza su sección "Estado actual".
