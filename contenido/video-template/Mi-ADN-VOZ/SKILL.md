---
name: mi-adn-voz
description: Analiza muestras de escritura de una persona para crear su perfil de "ADN de voz" (voice DNA), de modo que la IA escriba con su estilo auténtico. Úsala cuando alguien quiera capturar su voz de escritura, crear/actualizar su perfil de voz, o al iniciarse en el sistema de contenido. Se integra con la skill `contenido`: el perfil guía guiones, libretos y posts.
---

# Mi ADN de Voz (Voice DNA)

Analiza muestras de escritura para extraer y codificar un perfil de voz único
que la IA usa para replicar el estilo auténtico de la persona. Basado en la skill
`voice-dna-creator` (GitHub), adaptado a este proyecto: el perfil se guarda en
`Mi-ADN-VOZ/voice-dna.json` y lo usa la fábrica de contenido.

> **Lenguaje:** háblale a la persona en español neutro con "tú", nunca "vos".

## Cuándo usarla
- Al iniciarse en el sistema de contenido (una vez, junto al onboarding).
- Para crear el perfil de voz de una persona (o de un cliente, si es ghostwriting).
- Para actualizar el perfil cuando el estilo evolucionó.

## Requisitos (lo que pides a la persona)
- **Mínimo:** 3 muestras de escritura (500+ palabras cada una).
- **Ideal:** 5-10 muestras de distintos tipos de contenido.
- **Mejor:** mezcla de casual (posts de redes) y formal (artículos, correos).

## Proceso de análisis

### Paso 1 — EVALUACIÓN DE VOZ (OBLIGATORIA, es un gate)

Es lo PRIMERO al instalar, y un **gate**: no se avanza a nada hasta terminarla y
que la persona valide. Va en este orden exacto (3 fases):

**Fase 1 — Lectura automática del historial (primero, sin pedirle nada).**
Corre `node scripts/extraer-voz.mjs`: lee TODAS las conversaciones de la persona
en su Claude Code (esta máquina) y junta lo que escribió en
`Mi-ADN-VOZ/muestras/_historial.txt`. Analízalo y arma un **primer borrador** del
perfil. Preséntaselo en tú, tal cual:
> "Revisé cómo escribes en tus conversaciones y **esto es lo que tengo a simple
> vista**: [resumen del tono, rasgos y frases firma]. Ahora vamos a afinarlo con
> un par de preguntas para que quede 100% tú."
>
> Aclara el matiz: eso captura cómo escribes *hablándole a la IA*; lo afinamos
> con cómo le hablas a tu audiencia. (Solo lee el historial local de esta
> máquina; no toca WhatsApp, correo ni otros equipos.)

**Fase 2 — Afinar con la entrevista guiada (conversación natural, cálida).**
Suma 3 registros más, uno por vez:
- **Venta:** haz un mini roleplay — actúa como un cliente que le escribe
  interesado en un producto por WhatsApp; deja que responda normal (2-3 turnos).
- **Historia:** "Cuéntame cómo llegaste a esto — ¿hubo un momento donde dijiste
  'esto es lo mío'? ¿Y qué te hace seguir aunque el día venga pesado?"
- **Enseñanza:** "Imagina que un amigo está hoy como estabas tú al empezar, sin
  plata ni idea, y te dice 'quiero hacer esto pero no sé por dónde'. ¿Qué le dices?"

(Opcional, para pulir aún más: que pegue 1-2 textos reales de cara a su audiencia,
o los deje como `.txt` en `Mi-ADN-VOZ/muestras/`.)

**Fase 3 — Validar (gate).** Muestra el perfil afinado + 3 frases de ejemplo en su
voz y pregunta "¿suena a ti?". Solo con su "sí" pones `validado_por_la_persona:
true` y recién ahí se avanza.

### Paso 2 — Analizar los elementos base
Para cada muestra, analiza:

**Marcadores de personalidad** — ¿qué rasgos se notan? ¿nivel de energía? ¿cómo
se relaciona con quien lee?

**Rango emocional** — ¿qué emociones aparecen? ¿qué tan intensas? ¿tono dominante?

**Estilo de comunicación** — formalidad (casual↔profesional), largo de frases,
estructura de párrafos, uso de preguntas/órdenes/afirmaciones.

**Patrones de lenguaje** — frases firma que repite, palabras de poder,
transiciones, patrones de apertura y cierre.

**Lo que evita** — palabras/frases que nunca usa, tonos que no toma, enfoques que
evita.

**Hábitos de formato** — emojis, listas, encabezados, negritas/itálicas.

### Paso 3 — Sintetizar
Combina el análisis de todas las muestras para identificar: patrones constantes
(en la mayoría), variaciones por contexto (cambian según el tipo), y elementos
núcleo (nunca cambian).

### Paso 4 — Generar el ADN de voz
Crea el perfil con esta estructura y guárdalo en `Mi-ADN-VOZ/voice-dna.json`:

```json
{
  "voice_dna": {
    "version": "1.0",
    "last_updated": "YYYY-MM-DD",
    "core_essence": { "identity": "", "primary_role": "", "unique_angle": "" },
    "personality_traits": { "primary": [], "how_it_shows": {} },
    "emotional_palette": { "dominant_emotions": [], "emotional_range": {}, "energy_level": "" },
    "communication_style": { "formality": "", "complexity": "", "sentence_structure": {}, "paragraph_style": "" },
    "language_patterns": { "signature_phrases": [], "power_words": [], "words_to_avoid": [], "transitions": [] },
    "never_say": { "phrases": [], "tones": [], "approaches": [] },
    "formatting_preferences": {},
    "content_philosophy": {},
    "voice_examples": { "opening_lines": [], "closing_lines": [], "transitional_phrases": [] },
    "audience_voice": { "descripcion": "cómo le habla a su cliente/comunidad (venta)", "tono": [], "moves_de_venta": [], "signature_phrases_venta": [] },
    "storytelling_voice": { "descripcion": "cómo cuenta su historia/motiva", "arco_personal": "", "motor": "", "tono": [], "frases_reales": [] },
    "teaching_voice": { "descripcion": "cómo enseña/aconseja", "catchphrase": "", "aperturas": [], "tono": [], "muletillas": [] },
    "validado_por_la_persona": false
  }
}
```

Rellena los 4 registros con lo que salió en la entrevista (base/builder + venta +
historia + enseñanza). Deja `validado_por_la_persona: false` hasta que la persona
confirme.

## Instrucciones de salida
1. Presenta un resumen con los hallazgos clave.
2. Genera el JSON completo y **guárdalo en `Mi-ADN-VOZ/voice-dna.json`**.
3. Escribe **3 frases de ejemplo** en la voz capturada, para validar.
4. Pregunta: "¿Esto suena a ti? ¿Qué ajustarías?"
5. **GATE:** solo cuando la persona confirme ("sí, suena a mí"), pon
   `validado_por_la_persona: true` y recién ahí se puede avanzar a producir
   contenido. Si dice que no, itera el perfil con su feedback y vuelve a validar.
   **Sin `validado_por_la_persona: true`, la instalación/onboarding NO avanza.**

## Buenas prácticas
- Enfócate en TONO y PERSONALIDAD, no solo en las palabras.
- No hagas un perfil que solo repita frases.
- Captura el "sentir" de la escritura, no solo patrones.
- Incluye lo que NO se debe hacer (igual de importante).
- Que el perfil sea accionable para generar contenido.

## Prueba de validación
Escribe un párrafo corto sobre cualquier tema usando SOLO el ADN de voz como
guía. Pregunta: "¿Esto suena a ti?" Si no, itera el perfil según el feedback.

## Errores comunes a evitar
- No listar solo palabras frecuentes.
- No hacer una parodia (demasiado exagerada) de la voz.
- No ignorar el contexto (posts ≠ artículos).
- No perder la personalidad de fondo.
- No olvidar lo emocional.

## Integración con la fábrica de contenido (`contenido`)
Cuando exista `Mi-ADN-VOZ/voice-dna.json`, la skill `contenido` debe **aplicarlo**
al redactar guiones, libretos y posts de Skool: usar sus frases firma, su tono y
su energía; respetar `never_say` y `words_to_avoid`. Así el contenido suena a la
persona, no a IA genérica. Si no existe el perfil, se produce igual pero conviene
ofrecer crearlo con esta skill.
