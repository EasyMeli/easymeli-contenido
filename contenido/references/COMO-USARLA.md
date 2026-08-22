# Cómo funciona tu máquina de contenido (guía simple)

Explicado fácil, sin tecnicismos. Para releer cuando quieras.

## En una frase

Le das el tema de una clase de Easy Meli, y te devuelve varias piezas listas
para TikTok (video, carrusel, corto y post), todas con el estilo de tu marca.

## La idea, con una comparación

Pensá en una **cocina**. Tú traes el ingrediente principal (el tema). La skill
es el **chef**: sigue una receta y te saca varios platos con el mismo ingrediente
(un video, un carrusel de imágenes, un corto, un post). Tú solo **sirves** (lo
subes a TikTok). No tienes que cocinar tú: solo elegir el ingrediente.

## Lo que TÚ entregas (los ingredientes)

Solo dos cosas:

1. **El tema o la clase.** Puede ser el texto de una clase (una "transcripción")
   o simplemente una idea suelta, por ejemplo: "los cupones que se acumulan y te
   comen el margen".

2. **(Una sola vez) Tu llave y tus fotos:**
   - **La llave de Google** (API key): ya la pegaste en el archivo `.env`. ✅
   - **Tus fotos**: 3 a 6 fotos tuyas en la carpeta `referencias/`, para que en
     los videos aparezcas **tú** y no un desconocido. ⬜ (esto falta)

Eso es todo lo que sale de tu lado. El resto lo hace la máquina.

## Lo que la skill hace sola (lo que pasa por dentro)

1. **Elige el ángulo.** Del tema saca el mejor enfoque, siempre el "**por qué
   pasa esto**", nunca un tutorial de "dónde hacer clic".
2. **Escribe el contenido** en un archivo (el "guion"): el gancho de apertura,
   cada pantalla del video, y la descripción de la imagen de inicio.
3. **Genera una imagen impactante con IA** (Gemini) para abrir el video — con
   tu cara si cargaste tus fotos.
4. **Arma el video vertical de TikTok** (1080x1920): abre con esa imagen animada
   (zoom lento, luz) y sigue con tu contenido, con música de suspenso y efectos.
5. Del **mismo archivo** saca además: el **carrusel** de imágenes, un **corto**
   de 10 segundos, y un **borrador de post** para el Skool.
6. Te da la **descripción y los hashtags** para subir.

## El paso a paso para hacer UN video

La división del trabajo: **Claude hace lo creativo una vez** (elige el ángulo y
escribe el guion desde la clase). **Tú disparas lo mecánico con UN comando**
(no gasta tokens de Claude):

1. **Tema** → me pasas la clase; yo te dejo el `guiones/<tema>.json` listo.
2. **UN comando produce todo:**
   `npm run producir -- guiones/<tema>.json`
   → genera imagen + video + corto + carrusel + post + descripción de TikTok.
   (La imagen solo se genera si falta, para no volver a pagar Gemini. Flags:
   `--sin-imagen`, `--imagen` para rehacerla, `--preset numero`.)
3. Todo queda en `out/`: `<tema>.mp4`, `<tema>-corto.mp4`, las PNG del carrusel,
   `<tema>-skool.md`, `<tema>-tiktok.txt` (descripción + hashtags).
4. **Subes a TikTok** y, dentro de la app, le pones un **sonido que esté de
   moda** (eso ayuda al alcance y no se puede meter desde afuera).
5. Después de subir, **anotas cómo le fue** en la bitácora.

> Si quieres correr una pieza suelta: `npm run nuevo -- guiones/x.json` (solo el
> video), `--corto` (solo el corto), o los scripts python del carrusel/post.

## Lo que se configura una sola vez

- La **llave de Google** en `.env` ✅ (ya está).
- Tus **fotos** en `referencias/` ⬜ (mandámelas y quedan listas para siempre).

## Extra: la skill también te ayuda a DECIDIR

- **"¿Qué publico esta semana?"** → te arma un plan de 5 piezas variadas, sin
  repetir el mismo formato dos días seguidos.
- **Guarda lo que funcionó** ("ganadores"): cuando un video pega, lo anota, y
  los próximos parten de lo que ya trajo gente, en vez de arrancar de cero.

## Tu checklist

- [ ] Pon tus **fotos** en `referencias/` (3 a 6, varios ángulos).
- [ ] Decime el **tema** (o pasame la clase).
- [ ] Yo genero **imagen + video + carrusel + corto + post**.
- [ ] **Subes a TikTok** + sonido de moda.
- [ ] **Anotas** los resultados en la bitácora.

Y listo. Tu trabajo real es elegir el tema, subir, y poner el sonido. Todo lo
demás lo hace la máquina.

---

## ¿Está lista? El flujo completo y su estado

```
ENTRA:  clase (transcripción)  +  [tu clip grabado]  +  [tus fotos]
   │
   ├─ 1. Ángulo + guion (contenido en un archivo) .............. ✅ listo
   ├─ 2. Guion de grabación (lo que leés a cámara) ............. ✅ listo (método)
   │        → grabas tú con ese libreto
   ├─ 3. Imagen intro con tu cara (Gemini, 9:16) .............. ✅ listo*
   ├─ 4. VIDEO:
   │      • automático (escenas de datos + intro + música) .... ✅ listo
   │      • editando TU video (clip + subtítulos + efectos) ... ⬜ por construir
   ├─ 5. Carrusel de marca (imágenes) ......................... ✅ listo
   │      • carrusel con TUS imágenes Gemini .................. ⬜ por construir
   ├─ 6. Corto de 10s ........................................ ✅ listo
   ├─ 7. Post de Skool ....................................... ✅ listo
   └─ 8. Descripción + hashtags .............................. ✅ listo
   │
SALE:  piezas listas → subes a TikTok + sonido de moda → anotas en bitácora
```
\* la intro funciona ya; falta que cargues tus fotos en `referencias/` para que
sea TU cara.

**Además (decisión y aprendizaje):**
- Plan de la semana (qué publicar) ..... ✅ listo
- Bitácora (medir qué funciona) ......... ✅ listo
- Ganadores (repetir lo que convierte) .. ✅ listo
- Efectos de marca flotando (pro) ....... ✅ demostrado

**Entonces: ¿está lista?**
- La **máquina de contenido automático** (video sin grabarte, carrusel, corto,
  post, descripción, plan, medición): **SÍ, lista y probada.**
- La parte de **grabarte tú y que edite TU video** (Fase 6): **falta construir**
  — es el próximo bloque grande (template de footage + subtítulos automáticos +
  carrusel con tu cara + teleprompter).
