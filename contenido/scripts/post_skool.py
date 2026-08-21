"""Post de Skool DESDE el mismo guion.json del video/carrusel (Fase 2).

El video y el carrusel son de formato corto: el gancho + los golpes. El post
de Skool es el formato largo del MISMO ángulo — el lugar para explicar con
calma lo que en 22s no entra, y para pedir conversación (comentarios = señal
que Skool premia). Este script arma el BORRADOR desde el guion; después se
pule a mano con la voz de la comunidad.

Uso:
    python3 post_skool.py <ruta>/guiones/cupones.json
    python3 post_skool.py <ruta>/guiones/cupones.json --out out/cupones-skool.md
"""
import sys
import json
import os

# Marcas que .capitalize() rompe (baja las mayúsculas internas). Se restauran.
FIX = {
    "Mercadolibre": "MercadoLibre",
    "Meli": "Meli",
    "Easy meli": "Easy Meli",
}


def _prosa(texto):
    """Pasa un texto en MAYÚSCULAS (pensado para video) a prosa legible."""
    t = texto.strip()
    if t.isupper():
        t = t.capitalize()
    for mal, bien in FIX.items():
        t = t.replace(mal, bien)
    return t


def _hook(g):
    return _prosa(" ".join(l["text"] for l in g["portada"]["amenaza"]))


def post_desde_guion(path):
    with open(path, encoding="utf-8") as f:
        g = json.load(f)

    L = [f"**{_hook(g)}**", ""]

    for e in g["escenas"]:
        lay = e["layout"]
        if lay in ("titulo-cuerpo", "titulo-regla-cuerpo"):
            L += [f"**{_prosa(e['titulo'])}**", e["cuerpo"]]
        elif lay == "desglose":
            L.append(f"**{_prosa(e['titulo'])}**")
            for a, b in e["filas"]:
                L.append(f"- {_prosa(a)}: {b}")
            L.append(f"**{_prosa(e['total'][0])}: {e['total'][1]}**")
            if e.get("cuerpo"):
                L.append(e["cuerpo"])
        elif lay == "cierre":
            L += [f"**{_prosa(e['titulo'])} {_prosa(e['titulo2'])}**", "", f"👉 {_prosa(e['tarea'])}"]
        elif lay == "numero":
            L += [f"**{e['numero']}** — {_prosa(e['label'])}", e["caption"]]
        elif lay == "cita":
            L += [f"> \"{e['texto']}\"", f"> — {e['autor']}"]
        L.append("")

    L.append("¿Te pasó? Contámelo en los comentarios 👇 y te digo cómo revisarlo.")
    return "\n".join(L)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print("Uso: python3 post_skool.py <guion.json> [--out archivo.md]")
        sys.exit(1)
    texto = post_desde_guion(args[0])
    if "--out" in sys.argv:
        dest = sys.argv[sys.argv.index("--out") + 1]
        os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(texto)
        print("ok", dest)
    else:
        print(texto)
