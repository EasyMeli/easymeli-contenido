# 🧬 Mi ADN de Voz

Esta carpeta guarda tu **perfil de voz de escritura**: cómo escribes tú, para que
la fábrica de contenido redacte guiones, libretos y posts que suenen a ti y no a
IA genérica.

## Cómo se crea (paso OBLIGATORIO del onboarding)
No es opcional: es parte del proyecto. Al iniciarte, la fábrica de contenido te
lo va a pedir sí o sí, antes de producir — te pide **3 a 10 textos tuyos** (posts,
correos, mensajes… donde sientas "esto suena a mí"), los pegas en el chat, y crea
tu perfil aquí. (También puedes decir "quiero actualizar mi perfil de voz" cuando
tu estilo cambie.)

## Qué queda acá
- `voice-dna.json` — tu perfil de voz (se crea al usar la skill). Es tuyo y
  privado; queda fuera de git.
- `SKILL.md` — la definición de la skill (viene con el proyecto).

## Para qué sirve
Cuando existe tu `voice-dna.json`, la skill **`contenido`** lo usa al escribir:
aplica tus frases, tu tono y tu energía, y evita lo que tú nunca dirías. Cuanto
mejor sea tu perfil, más "tú" suena todo lo que se genera.
