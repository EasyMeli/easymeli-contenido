# Carruseles de TikTok

## Cuándo usarlos

Sirven para las formas C (comparación) y D (número): lo visual carga
el argumento y no dependen de la voz.

No sirven para la forma F. Las historias personales sin voz pierden la
mitad, y el funnel no vende información — vende que confíen en una
persona. La gente le escribe a una cara, no a un texto.

Tampoco reemplazan a los videos. Es probable que el carrusel dé buenos
guardados y pocos mensajes: eso lo convierte en formato de alcance, no
de captación. Sirve igual, pero para otra cosa.

## Estructura

Cinco o seis slides.

**Slide 1 — la portada.** No explica: frena. El "menos de 1 segundo" no
se juega viendo la slide grande, se juega en la **miniatura del feed**,
chiquita, mientras el dedo ya baja. Reglas de portada, probadas:

- **Un solo foco.** Una portada = una idea visual. Nada de apilar tres
  números + una operación + un titular: en miniatura eso es ruido y el
  ojo no se fija en nada. Si quieres mostrar la matemática (10%+10%=20%),
  va en la slide 2, no en la portada.
- **Lidera con la tensión, no con la respuesta.** Un número grande con
  "%" se lee como promo de vendedor, y la promo se scrollea. Lo que para
  el dedo es la amenaza en 2ª persona: "ESTÁS REGALANDO UN 20% Y NO LO
  SABES". No parece venta, parece un problema del que mira.
- **Un solo amarillo.** El amarillo dirige el ojo; en la portada va solo
  en la palabra clave del gancho. Badge y contador se sacan.
- **Branding mínimo.** Logo chico arriba y el handle abajo, nada más. El
  gancho se lleva el frame entero. La marca fuerte va en las internas.
- **Valida en miniatura.** Antes de publicar, mira la portada reducida al
  tamaño del feed y entrecerrá los ojos. Si el gancho se lee así, sirve.

El generador trae esto como componente `cover_threat` (ver abajo).

**Slides intermedias** — una idea por slide. Poco texto. La tentación
es meter párrafos porque cabe.

**Slide final** — la conclusión, y abajo una tarea concreta en letra
chica si corresponde ("anda a revisar tus cupones activos"). No un CTA
duro.

## Copy del post

En carrusel el texto largo funciona: suma tiempo de permanencia, que es
señal de ranking, y el formato se consume más lento.

Condición: no puede repetir las slides. Si repite, lo saltan. Tiene que
agregar contexto, matices o el caso completo.

Cierra siempre con una pregunta directa. En carrusel los comentarios
cuestan más que en video y la pregunta es lo que los desbloquea.

## Sistema visual (v2 — con marca Easy Meli)

Dimensiones: 1080 x 1920.

Paleta navy (derivada del logo):
- Fondo `#0A162E` — navy profundo, con vignette radial suave
- Panel `#10244F` — marcos y barras
- Azul marca `#1E56E8` — el azul de la caja del logo
- Amarillo señal `#FFC400` — la flecha del logo; **solo** para el dato o
  la palabra que importa (un amarillo por slide)
- Texto `#F4F1E8` — blanco papel cálido
- Apagado `#8492BE` — periwinkle para etiquetas y secundarios
- Línea `#21386B` — separadores

Tipografía (en `assets/`):
- Archivo Black — títulos y cifras. Pesado, se lee en miniatura.
- Barlow Condensed Bold — texto secundario y frases largas.
- Space Mono Bold — etiquetas, montos, metadatos. Da aire de documento.

Marca en cada slide interna: el logo real (`assets/logo.png`) grande
arriba a la izquierda con el wordmark EASY/MELI, una pestaña amarilla con
la etiqueta corta, el contador `01/06` arriba a la derecha, y una silueta
tenue del logo como marca de agua al centro. Evoca un expediente firmado.

**Por qué navy y no fondo amarillo**: el logo es azul + amarillo, casi
los colores de MercadoLibre. Copiar la paleta de ML (fondo amarillo,
texto oscuro) haría parecer al canal oficial o afiliado — choca con un
ángulo que a veces critica a la plataforma. La solución: **fondo oscuro**
(eso da la distancia editorial y frena mejor el scroll) **con el azul y
amarillo del logo como acentos + el logo real como sello**. Así hay
coherencia de marca sin parecer la plataforma.

## Script generador

`scripts/generar_carrusel.py` es un toolkit reutilizable. Genera las
slides como PNG en `./out/` con la clase `Slide`. Trae un ejemplo
completo (cupones acumulables) al final; adaptá el contenido usando los
componentes, no reescribas el dibujo.

Rutas: usa las fuentes y el logo de `~/.claude/skills/contenido/assets/`.
Se corre parado en la carpeta donde quieras el `out/`:
`cd <carpeta> && python3 ~/.claude/skills/contenido/scripts/generar_carrusel.py`

API:

```python
# Portada (slide 1): amenaza en 2ª persona, un foco, un amarillo
s = Slide(None, 1, cover=True)
s.cover_threat([("ESTÁS", 0), ("REGALANDO", 0),
                ("UN 20%", 1),          # 1 = amarillo (una sola línea)
                ("Y NO LO", 0), ("SABES", 0)])
s.save("01-portada.png")

# Slides internas: header de marca completo
s = Slide("EL MECANISMO", 2)            # kicker de la pestaña, número
s.title("EL CUPÓN ES ACUMULABLE")       # titular (auto-ajusta tamaño)
s.body("texto largo...", y, fill=YELLOW)
s.ledger([("PROMOCIÓN", "-10%"),        # desglose tipo factura
          ("CUPÓN", "-10%")], total=("SALE", "-20%"))
s.task("ANDA A REVISAR TUS CUPONES")    # tarea al pie, no CTA duro
```

Componentes: `cover_threat`, `title`, `body`, `hero_num`, `ledger`,
`rule`, `task`, `center`, `cline`. Todos auto-ajustan el ancho para que
el texto no se desborde del margen seguro (908px).

### Carrusel desde el MISMO guion.json del video (Fase 2 — repurposing)

No hace falta reescribir el contenido: el carrusel se genera del mismo
`guion.json` que el video (ver `references/video.md`). Un archivo → dos
formatos.

```
python3 ~/.claude/skills/contenido/scripts/generar_carrusel.py \
        <ruta>/video-remotion/guiones/cupones.json
```

`carrusel_desde_guion(path)` lee el guion y mapea cada escena a su
componente: `titulo-cuerpo`→title+body, `titulo-regla-cuerpo`→title+rule+
body, `desglose`→title+ledger, `cierre`→dos títulos+task, `numero`→
hero_num, `cita`→título entrecomillado+autor. La portada usa `amenaza`.
El color de cuerpo sale de `cuerpoColor` (yellow/muted/paper). Sin
argumento `.json`, el script corre el demo hardcodeado del final.

Recursos visuales que ya funcionaron:
- Portada de amenaza en 2ª persona (`cover_threat`) — la que ganó el test
- Desglose tipo factura (`ledger`) con concepto a la izquierda y monto a
  la derecha, y un total en amarillo
- Cifra gigante centrada (`hero_num`) para la forma D
- Operación aritmética a pantalla completa

## Revisión antes de publicar

Abre cada PNG y míralo. Los choques de texto no aparecen hasta que se
ve la imagen renderizada. El auto-ajuste evita los desbordes de ancho,
pero revisa igual el apilado vertical y la portada en miniatura.
