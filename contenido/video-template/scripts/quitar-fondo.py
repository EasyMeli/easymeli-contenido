"""Quita el fondo (blanco/liso) de un PNG por flood-fill desde los bordes, sin
agujerear los brillos internos del objeto. Recorta al objeto y achica.
    python3 quitar-fondo.py entrada.png salida.png
"""
import sys
from PIL import Image, ImageDraw

inp, outp = sys.argv[1], sys.argv[2]
im = Image.open(inp).convert("RGB")
w, h = im.size
mark = (255, 0, 255)
seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
for s in seeds:
    try:
        ImageDraw.floodfill(im, s, mark, thresh=42)
    except Exception:
        pass
rgba = im.convert("RGBA")
px = rgba.load()
for y in range(h):
    for x in range(w):
        if px[x, y][:3] == mark:
            px[x, y] = (0, 0, 0, 0)
bbox = rgba.getbbox()
if bbox:
    rgba = rgba.crop(bbox)
rgba.thumbnail((600, 600), Image.LANCZOS)
rgba.save(outp)
print("ok", outp, rgba.size)
