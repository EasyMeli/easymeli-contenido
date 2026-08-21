"""Teleprompter — el TEXTO QUE DECÍS A CÁMARA, derivado del mismo guion.json.

Sigue la estructura de venta de references/guion-grabacion.md (gancho filtra →
valor sin vender → CTA visual), apuntando a ~60-80 palabras habladas (~20-30s).
No inventa contenido: reordena y pasa a prosa lo que ya está en el guion (o
usa el bloque `grabacion` del guion si lo escribiste a mano).

Uso:
    python3 teleprompter.py <ruta>/guiones/cupones.json
    python3 teleprompter.py <ruta>/guiones/cupones.json --out out/cupones-teleprompter.md
"""
import sys
import json
import os
import re

FIX = {"Mercadolibre": "MercadoLibre", "Meli": "Meli", "Easy meli": "Easy Meli"}


def _prosa(texto):
    """MAYÚSCULAS (pensado para pantalla) → prosa legible para leer a cámara."""
    t = (texto or "").strip()
    if t and t.isupper():
        t = t.capitalize()
    for mal, bien in FIX.items():
        t = t.replace(mal, bien)
    return t


def _palabras(*textos):
    return len(re.findall(r"\b\w+\b", " ".join(textos)))


def teleprompter(path):
    with open(path, encoding="utf-8") as f:
        g = json.load(f)
    tema = os.path.basename(path).replace(".json", "")
    grab = g.get("grabacion", {})  # override manual opcional

    # ── Título gancho (texto en pantalla, ~6s): la portada amenaza tal cual ──
    titulo_gancho = grab.get("tituloGancho")
    if not titulo_gancho:
        amenaza = g.get("portada", {}).get("amenaza", [])
        titulo_gancho = " ".join(l["text"] for l in amenaza) if amenaza else tema.upper()

    micro_cta = grab.get("microCta", "Guardá este video.")

    # ── Gancho hablado (0-5s): filtra al cliente ideal en 2ª persona ──
    gancho = grab.get("gancho")
    if not gancho:
        desc = g.get("publicacion", {}).get("descripcion", "")
        gancho = re.split(r"(?<=[.!?])\s+", desc.strip())[0] if desc else _prosa(titulo_gancho)

    # ── Valor (vender sin vender): el mecanismo / por qué / dónde duele ──
    valor = grab.get("valor")
    if not valor:
        lineas = []
        for e in g.get("escenas", []):
            lay = e.get("layout")
            if lay == "cierre":
                continue
            if lay == "desglose" and e.get("filas") and e.get("total"):
                partes = ", ".join(f"{_prosa(a).lower()} {b}" for a, b in e["filas"])
                linea = f"{partes}: {_prosa(e['total'][0]).lower()} {e['total'][1]}."
                lineas.append(linea[0].upper() + linea[1:])
            elif e.get("cuerpo"):
                lineas.append(_prosa(e["cuerpo"]))
        valor = " ".join(lineas)

    # ── CTA final (VISUAL): la tarea del cierre + a dónde ir ──
    cta = grab.get("ctaFinal")
    if not cta:
        cierre = next((e for e in g.get("escenas", []) if e.get("layout") == "cierre"), None)
        base = _prosa(cierre["titulo"]) + " " + _prosa(cierre.get("titulo2", "")) if cierre else ""
        cta = (base.strip() + " Te dejo el link a la comunidad en mi perfil.").strip()
    handle = g.get("handle", "")

    total = _palabras(gancho, valor, cta)
    segs = round(total / 2.5)  # ~2.5 palabras/segundo hablado
    aviso = "" if total <= 85 else (
        f"\n> ⚠ {total} palabras (~{segs}s): pasa de los 20-30s ideales. Recortá el VALOR a lo esencial.\n"
    )

    md = f"""# 🎬 Guion de grabación — {tema}

_Lo que decís a cámara. Apuntá a 20-30s (~60-80 palabras). Gancho en los
primeros 5s, valor en el medio, CTA visual al final._
{aviso}
## En pantalla (texto sobreimpreso)

- **TÍTULO GANCHO** (~6s, arriba, letra grande): `{titulo_gancho}`
- **MICRO-CTA** (chip temprano): `{micro_cta}`

## Lo que decís

**— GANCHO · 0-5s** _(a cámara, 2ª persona: si no vende en ML, que se vaya)_
> {gancho}

**— VALOR · ~10-15s** _(vendé sin vender: explicá el mecanismo, no el "dónde hacer clic")_
> {valor}

**— CTA FINAL · ~5s** _(SIEMPRE visual: mostrá una captura con una flecha a dónde ir)_
> {cta}

_En edición: acá va una captura de pantalla real con una flecha/círculo que
pulsa señalando el link o el botón. Handle: {handle}_

---
_Palabras habladas: {total} · duración estimada: ~{segs}s_
"""
    return md, total, segs


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else None
    if not args:
        print("Uso: python3 teleprompter.py <guion.json> [--out archivo.md]")
        sys.exit(1)
    md, total, segs = teleprompter(args[0])
    print(md)  # siempre a pantalla: es lo que leés para grabar
    if out:
        os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
        with open(out, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"\n(guardado en {out} · {total} palabras · ~{segs}s a cámara)")
