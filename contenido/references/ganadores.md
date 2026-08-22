# Ganadores — lo que ya funcionó

Memoria de lo que convirtió, para reusarlo en vez de reinventarlo. Cada
entrada sale de `bitacora.md` con su métrica: no se anota una corazonada,
se anota lo que trajo retención alta, guardados, DMs concretos o signups.

**Cómo se usa:** antes de proponer un hook, un sonido o un CTA nuevos,
mira acá primero. Si algo de esta lista aplica al tema, reúsalo o haz una
variante — no arranques de cero. **Cómo se llena:** cuando una fila de la
bitácora demuestre que algo pegó (a los 3-7 días, con métricas ya
estables), subilo acá con el dato que lo respalda.

Umbral para entrar (una pieza es "ganadora" si cumple al menos uno):
- Retención ≥ 39% (benchmark del nicho), o notablemente sobre el promedio propio.
- Varios guardados/compartidos respecto a sus vistas.
- Trajo ≥ 1 DM **concreto** (no vago) o ≥ 1 signup atribuible.

---

## Hooks que pegaron

| Hook | Forma | Terreno | Métrica que lo respalda | Pieza |
|---|---|---|---|---|
| _(vacío — se llena con la bitácora)_ | | | | |

Candidatos en observación (aún sin métrica confirmada):
- "Estás regalando un 20% y no lo sabes" — forma A, terreno 3 (cupones
  acumulables). Retención pendiente en TikTok (releer 20-21 ago). Si supera
  el umbral, sube a la tabla.

## Sonidos que convirtieron

| Sonido | Tipo | Con qué pieza | Métrica | Nota |
|---|---|---|---|---|
| _(vacío)_ | | | | |

Candidatos en observación:
- "Dustfoot Dan - Black Chrome" (trending, agregado en TikTok al subir el
  video de cupones). Sin dato de retención aún.

## CTAs que trajeron DMs concretos

| CTA | Cómo se pidió | DMs concretos | Signups | Pieza |
|---|---|---|---|---|
| _(vacío)_ | | | | |

## Aperturas / recursos visuales que retuvieron

| Recurso | Dónde | Métrica | Nota |
|---|---|---|---|
| _(vacío)_ | | | | |

Candidatos en observación (por diseño, aún sin A/B propio):
- Portada de **amenaza** en 2ª persona (`cover_threat`) — ganó el A/B de
  portadas al construir el sistema, falta confirmarlo con retención real.
- Desglose tipo factura (`ledger`) con total en amarillo — el "golpe" del
  video/carrusel de cupones.

---

## Revisión trimestral del stack (Fase 4, continuo)

Cada ~3 meses, revisar que la skill no se quede vieja (TikTok cambia rápido):

- **Remotion**: versión vigente vs. la instalada (hoy 4.0.513). Add-ons
  útiles nuevos (captions cuando haya voz en off, lottie con un `.json`
  real de LottieFiles, etc.).
- **Formatos de TikTok**: ¿cambió la zona segura, la duración óptima, el
  formato del feed? Ajustar `MARGIN`/`BOTTOM` en `video-remotion/src/ui.tsx`
  si hace falta.
- **Sonidos/tendencias**: qué está trending y sirve al nicho (se agregan
  dentro de la app de TikTok al subir; no se descargan).
- **Anotar la revisión** con fecha acá abajo.

| Fecha revisión | Qué se revisó | Cambios aplicados |
|---|---|---|
| 2026-08-19 | Arranque de la Fase 4 (creación de este archivo). Stack: Remotion 4.0.513. | Ninguno; línea base. |
