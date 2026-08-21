# Manual de uso — Fábrica de contenido Easy Meli

Esta herramienta convierte **una grabación tuya hablando + un archivo de texto
con el contenido** en un paquete listo para publicar:

- 🎬 un **video** editado (subtítulos, efectos de cámara, objetos 3D, tu intro y un cierre con llamado a la acción),
- 🖼️ un **carrusel** de 6 imágenes con tu cara en la portada y el cierre,
- ⏱️ un **corto** de ~10 segundos,
- 📝 un **post** para la comunidad (Skool),
- 🗒️ un **teleprompter** (lo que tenés que decir a cámara),
- #️⃣ la **descripción y hashtags** para TikTok.

No hace falta saber programar. Se trata de: llenar un archivo, grabarte, y correr **un comando**.

---

## 0) Lo que necesitás tener instalado (una sola vez)

- **Node.js** (para correr los comandos). Bajalo de nodejs.org e instalá la versión "LTS".
- **Python 3** (para el carrusel). En Mac normalmente ya viene.
- Una **clave de Google AI Studio (Gemini)** — es la que genera las imágenes con tu cara y los objetos 3D. Se saca gratis en `https://aistudio.google.com/apikey` (hay que activarle facturación para que genere imágenes; el gasto es de centavos por imagen).

> Todos los comandos se corren **dentro de la carpeta `video-remotion`**. En la
> Terminal, esa carpeta se "entra" con `cd`. Si no sabés hacerlo, pedile a
> alguien que te muestre una vez cómo abrir la Terminal en esa carpeta.

---

## 1) Preparación inicial (se hace UNA vez)

### a. Instalar las piezas internas
Dentro de `video-remotion`, corré:

    npm install

(Descarga todo lo que la herramienta necesita. Tarda unos minutos la primera vez.)

### b. Poner tu clave de Gemini
En la carpeta `video-remotion` hay un archivo llamado **`.env`**. Abrilo con un
editor de texto y dejá adentro una línea así (pegando TU clave):

    GEMINI_API_KEY=tu-clave-aca

> Tu clave es privada. Nunca la compartas ni la pegues en un chat. La
> herramienta la lee sola de este archivo.

### c. Tus fotos de referencia (tu cara)  → carpeta `referencias/`
Para que el personaje de los videos y los carruseles seas **vos**, poné de 3 a 5
fotos tuyas en la carpeta **`referencias/`**:

- Una **de frente**, una de **tres cuartos** (girado ~45°) y una de **perfil**.
- Buena luz, cara despejada, sin lentes de sol.
- Nombralas ordenadas, por ejemplo: `01-frente.jpeg`, `02-tres-cuartos.jpeg`, `03-perfil.jpeg`.

Estas fotos son **privadas** y no se comparten.

### d. Generar los objetos 3D (los iconitos que flotan en el video) → una vez
Corré:

    node scripts/generar-objetos.mjs

Esto crea una biblioteca de 11 objetos 3D de marca (cupón, billete, camión,
etc.) que aparecen en el video cuando decís esa palabra. **Se hace una sola vez**
y quedan guardados en `public/objetos/`.

- ¿Querés **agregar** un objeto nuevo (ej. "candado")? Abrí
  `scripts/generar-objetos.mjs`, agregá una línea en la lista `OBJETOS` con el
  nombre y una descripción, y corré `node scripts/generar-objetos.mjs candado`.
- ¿No te gustó cómo quedó uno? Regeneralo: `node scripts/generar-objetos.mjs cupon --force`.

---

## 2) El mapa: dónde va cada cosa

**Cada tema es UNA carpeta** dentro de `temas/`, con todo lo suyo adentro:

```
temas/
  envios/                 ← el tema
    envios.json           ← el guion (el contenido)
    grabaciones/          ← 1 o VARIOS clips (se unen con transiciones)
      1.mp4
      2.mp4
      3.mp4
    capturas/             ← opcional: la captura del cierre
      cierre.png
```

| Carpeta | Qué poner ahí | ¿Vos lo tocás? |
|---|---|---|
| `temas/<tema>/<tema>.json` | El guion (el contenido del tema) | Sí, por cada tema |
| `temas/<tema>/grabaciones/` | Tu(s) clip(s): `1.mp4`, `2.mp4`… | Sí, por cada tema |
| `temas/<tema>/capturas/` | *(Opcional)* la captura del cierre | Opcional |
| `referencias/` | Tus 3-5 fotos de cara (**compartidas**, una vez) | Sí, una vez |
| `public/objetos/` | Los objetos 3D (**compartidos**, se generan solos) | No |
| `out/<tema>/` | Acá **sale todo** lo terminado, una carpeta por tema | No — es la "bandeja de salida" |

**Regla de oro:** el **tema** es el nombre de la carpeta. Todo lo de "envíos"
vive en `temas/envios/`, y todo lo terminado sale en `out/envios/`. Tus fotos de
cara y los objetos 3D son **compartidos** entre todos los temas (no se repiten).

> **Varios clips:** si grabás el mismo tema en varios planos, dejás cada toma en
> `grabaciones/` (`1.mp4`, `2.mp4`, `3.mp4`). Se unen **en ese orden** con
> transiciones profesionales. *(Para esto hace falta ffmpeg instalado —
> `brew install ffmpeg` en Mac. Con un solo clip no se necesita.)*

---

## 3) Hacer un video nuevo (el ciclo, en orden)

> **El orden importa.** Primero sale el contenido y el libreto; con el libreto
> en la mano grabás; recién al final se arma todo. No podés grabar sin saber qué
> decir — por eso el libreto va ANTES de la grabación.

### Paso 1 — El contenido: pegale la transcripción de tu clase a Claude
Le pasás a la IA (Claude) la **transcripción de la clase** (o la idea). Claude te
arma la carpeta del tema con su guion: `temas/envios/envios.json` (gancho,
escenas, post). Este es el paso donde se *piensa* el contenido; lo demás es
mecánico.

*(Si preferís hacerlo a mano: copiá la carpeta `temas/cupones/`, renombrala a tu
tema y cambiá los textos del `.json`.)*

### Paso 2 — Sacá el libreto (lo que vas a decir a cámara)
Con el guion listo, pedí el libreto **antes de grabar** (solo el nombre del tema):

    npm run libreto -- envios

Sale en pantalla (y se guarda en `out/envios/envios-teleprompter.md`): el gancho
de los primeros 5s, el valor, y el cierre. Está calibrado a ~20-30 segundos.

### Paso 3 — Grabate leyendo el libreto y guardá el/los clip(s)
Grabá con el celular (**vertical**), mirando a cámara, leyendo el libreto. Guardá
cada toma en la carpeta del tema:

- Un solo video: `temas/envios/grabaciones/1.mp4`
- Varios planos: `1.mp4`, `2.mp4`, `3.mp4` → se unen en ese orden con
  transiciones profesionales.

### Paso 4 *(opcional)* — Captura para el cierre
Si querés que el video termine mostrando a dónde ir (tu perfil con el link),
guardá una captura en `temas/envios/capturas/` (cualquier `.png`). Si no, el
cierre sale con una tarjeta de texto. No se rompe nada.

### Paso 5 — Un comando arma TODO lo demás
Ya con tu(s) grabación(es) en su lugar (solo el nombre del tema):

    npm run todo -- envios

Une los clips, genera tu intro con IA, transcribe tu audio para los subtítulos,
edita el video, arma el carrusel con tu cara, el corto, el post y los hashtags.
Puede tardar varios minutos (el render es lo más lento).

### Paso 6 — Buscá los resultados en `out/envios/`
Cada tema arma **su propia carpeta** dentro de `out/`, así nunca se mezcla con
otros. Adentro de `out/envios/`:

- `envios-hablado.mp4` → el video principal
- `01-portada.png` … `06-cierre.png` → el carrusel
- `envios-corto.mp4` → el corto de 10s
- `envios-skool.md` → el post para la comunidad
- `envios-teleprompter.md` → lo que dijiste / tenías que decir a cámara
- `envios-tiktok.txt` → descripción + hashtags

---

## 4) Cómo ajustar cosas (sin tocar código)

Si algo no te cerró (subtítulos muy abajo, cámara muy quieta, la flecha del
cierre apunta al lugar equivocado), lo ajustás con un comando y volvés a
renderizar. Los ajustes quedan **guardados en el guion** de ese tema.

    # subir/bajar subtítulos (número más alto = más arriba) y agrandar la letra
    node scripts/ajustar-video.mjs envios --subs-altura 340 --subs-letra 64

    # estilo de cámara: auto (varía solo) · reposado · dinamico · agresivo
    node scripts/ajustar-video.mjs envios --camara agresivo

    # mover a dónde apunta la flecha del cierre (0 a 1; x = izq→der, y = arriba→abajo)
    node scripts/ajustar-video.mjs envios --cta-x 0.5 --cta-y 0.48

Después de ajustar, volvé a correr:

    node scripts/producir-hablado.mjs envios

> Los **subtítulos** los transcribe la máquina. Si escuchó mal una palabra, se
> corrige a mano en `temas/envios/envios.captions.json` y se vuelve a renderizar.

---

## 5) Lo mínimo que tenés que recordar

1. **Una vez:** `npm install`, la clave en `.env`, tus fotos en `referencias/`, y `node scripts/generar-objetos.mjs`.
2. **Contenido:** le pegás la transcripción a Claude → te arma `temas/<tema>/<tema>.json`.
3. **Libreto:** `npm run libreto -- <tema>` → lo leés y grabás.
4. **Grabás:** guardás tu(s) clip(s) en `temas/<tema>/grabaciones/` (`1.mp4`, `2.mp4`…).
5. **Un comando:** `npm run todo -- <tema>`.
6. **Resultado:** todo en `out/<tema>/` (una carpeta por tema).

La carpeta `out/` es **desechable**: si se llena o algo salió mal, borrala y
volvé a correr el comando. Todo se regenera desde el guion y tu grabación.

---

## Problemas comunes

- **"No hay grabaciones..."** → no dejaste ningún clip en `temas/<tema>/grabaciones/`.
- **"No existe el guion..."** → la carpeta `temas/<tema>/` no tiene su `.json`, o escribiste mal el nombre del tema.
- **"Falta GEMINI_API_KEY"** → no pusiste la clave en `.env` (paso 1, punto 3).
- **Los clips no se unen con transiciones** → falta ffmpeg. Instalalo con `brew install ffmpeg` (Mac). Sin él, con varios clips usa solo el primero.
- **La cara del carrusel no sos vos / sale genérica** → faltan fotos en `referencias/` o son de mala calidad.
- **Un objeto 3D quedó feo** → `node scripts/generar-objetos.mjs <nombre> --force`.
- **Ordenar `out/`** → cada tema tiene su carpeta `out/<tema>/`; es desechable, la podés vaciar y se regenera con `npm run todo -- <tema>`.
