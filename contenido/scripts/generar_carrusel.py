"""Generador de carruseles Easy Meli — sistema visual v2.

Fondo navy editorial (distancia de MercadoLibre) + azul/amarillo del logo
como marca + logo real de la comunidad como sello en cada slide.

Portada (slide 1): estilo AMENAZA en 2ª persona, un solo foco, un solo
amarillo, branding mínimo. Es lo que frena el scroll en <1s en el feed.
Slides internas: header de marca completo + contenido.

API rápida:
    s = Slide("DESCUENTOS", 1)                       # slide interna
    s = Slide(None, 1, cover=True)                    # portada
    s.cover_threat([("ESTÁS", 0), ("REGALANDO", 0),   # 0 = papel
                    ("UN 20%", 1), ("Y NO LO", 0),    # 1 = amarillo
                    ("SABES", 0)])
    s.title("EL CUPÓN ES ACUMULABLE")
    s.body("texto...", y, fill=YELLOW)
    s.ledger([...], total=("SALE","-20%"))
    s.task("ANDA A REVISAR...")
    s.save("01-hook.png")

Requiere Pillow y las fuentes en FONTS. El logo va en assets/logo.png
(PNG con transparencia); si falta, se dibuja un isotipo vectorial plano.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import sys
import json

W, H = 1080, 1920

FONTS = os.path.expanduser("~/.claude/skills/contenido/assets/")
# Carpeta de salida. Por defecto ./out/, pero el pipeline la pone por tema
# (out/<tema>/) vía la variable de entorno CARRUSEL_OUT.
OUT   = os.environ.get("CARRUSEL_OUT", "./out/")
if not OUT.endswith("/"):
    OUT += "/"
LOGO_PNG = os.path.join(FONTS, "logo.png")

# ---- paleta de marca (derivada del logo Easy Meli) ----
INK    = (10, 22, 46)      # navy profundo — fondo
INK_HI = (17, 34, 68)      # navy del degradado sutil
BLUE   = (30, 86, 232)     # azul caja (marca)
YELLOW = (255, 196, 0)     # amarillo flecha (señal de marca)
PAPER  = (244, 241, 232)   # blanco papel cálido — texto principal
MUTED  = (132, 146, 190)   # periwinkle apagado — secundarios
LINE   = (33, 56, 107)     # separadores
PANEL  = (16, 36, 79)      # marcos y barras


def _f(name, size):
    return ImageFont.truetype(FONTS + name, size)

def F_DISPLAY(s): return _f("ArchivoBlack-Regular.ttf", s)
def F_BODY(s):    return _f("BarlowCondensed-Bold.ttf", s)
def F_MONO(s):    return _f("SpaceMono-Bold.ttf", s)


def _bg():
    """Fondo navy con vignette radial suave: profundidad sin ruido."""
    base = Image.new("RGB", (W, H), INK)
    grad = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(grad)
    cx, cy = W // 2, int(H * 0.40)
    maxr = int((W ** 2 + H ** 2) ** 0.5 / 1.5)
    for i in range(28):
        r = maxr * (1 - i / 28)
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=int(70 * i / 28))
    grad = grad.filter(ImageFilter.GaussianBlur(120))
    hi = Image.new("RGB", (W, H), INK_HI)
    return Image.composite(hi, base, grad)


def _photo_bg(path, top=0.86, bottom=0.6):
    """Fondo con TU FOTO (rostro generado con Gemini), recortada a 9:16, teñida
    hacia el navy de marca y con un degradado oscuro fuerte arriba (para el
    titular) y suave abajo (para el footer). Así la foto se integra a la
    identidad y el texto siempre se lee."""
    ph = Image.open(path).convert("RGB")
    r = max(W / ph.width, H / ph.height)
    ph = ph.resize((int(ph.width * r), int(ph.height * r)), Image.LANCZOS)
    ph = ph.crop(((ph.width - W) // 2, 0, (ph.width - W) // 2 + W, H))
    ph = Image.blend(ph, Image.new("RGB", (W, H), INK), 0.20)  # tinte navy
    grad = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(grad)
    for yy in range(H):
        t = yy / H
        a_top = max(0.0, (0.52 - t) / 0.52)      # oscuro arriba → 0 al 52%
        a_bot = max(0.0, (t - 0.80) / 0.20)      # limpio hasta 80% → oscuro abajo
        gd.line([(0, yy), (W, yy)], fill=min(255, int(255 * (top * a_top + bottom * a_bot))))
    return Image.composite(Image.new("RGB", (W, H), (4, 10, 22)), ph, grad)


_LOGO_CACHE = {}

def _load_logo():
    """Logo real con transparencia. Si viniera con fondo negro sólido, lo
    recorta a transparente por luminancia."""
    if not os.path.exists(LOGO_PNG):
        return None
    if "img" not in _LOGO_CACHE:
        logo = Image.open(LOGO_PNG).convert("RGBA")
        if logo.getchannel("A").getextrema() == (255, 255):
            gray = logo.convert("L")
            alpha = gray.point(lambda v: 0 if v < 18 else min(255, int(v * 2.2)))
            logo.putalpha(alpha)
        _LOGO_CACHE["img"] = logo
    return _LOGO_CACHE["img"]


def _paste_logo(img, cx, cy, s):
    """Pega el logo real centrado en (cx,cy) a tamaño s. Devuelve True si
    lo hizo; False si no hay logo (para caer al vector)."""
    logo = _load_logo()
    if logo is None:
        return False
    lg = logo.copy()
    lg.thumbnail((s, s), Image.LANCZOS)
    img.paste(lg, (int(cx - lg.width / 2), int(cy - lg.height / 2)), lg)
    return True


def _isotipo_vector(d, cx, cy, s):
    """Isotipo plano de respaldo: caja abierta azul + flecha amarilla."""
    u = s / 100.0
    def P(x, y): return (cx + (x - 50) * u, cy + (y - 50) * u)
    lw = max(3, int(7 * u))
    d.line([P(28, 58), P(28, 88), P(72, 88), P(72, 58)], fill=BLUE, width=lw, joint="curve")
    d.line([P(28, 58), P(16, 46), P(40, 40)], fill=BLUE, width=lw, joint="curve")
    d.line([P(72, 58), P(84, 46), P(60, 40)], fill=BLUE, width=lw, joint="curve")
    d.line([P(28, 58), P(50, 66), P(72, 58)], fill=BLUE, width=lw, joint="curve")
    d.line([P(50, 62), P(50, 22)], fill=YELLOW, width=int(lw * 1.6))
    d.polygon([P(50, 8), P(36, 28), P(64, 28)], fill=YELLOW)


class Slide:
    def __init__(self, kicker, n, total=6, cover=False, watermark=True, photo=None):
        self.photo = bool(photo)
        self.img = _photo_bg(photo) if photo else _bg()
        self.d = ImageDraw.Draw(self.img)
        self.total = total
        if cover:
            if watermark and not photo:
                self._ghost(0.72)
            self._brand_min()
        else:
            if watermark and not photo:
                self._ghost(0.52)
            if photo:
                # sobre foto: chrome mínimo (contador arriba-derecha), marca en el footer
                c = f"{n:02d}/{total:02d}"
                self.d.text((W - 90 - self.d.textlength(c, font=F_MONO(28)), 70), c, font=F_MONO(28), fill=MUTED)
            else:
                self._header(kicker, n, total)
            self._footer()

    def _shadow(self, xy, text, font, fill, off=5):
        """Texto con sombra dura (para leerse sobre foto)."""
        x, y = xy
        self.d.text((x + off, y + off), text, font=font, fill=(3, 8, 18))
        self.d.text((x, y), text, font=font, fill=fill)

    # ---- marca de fondo ----
    def _ghost(self, cy):
        logo = _load_logo()
        if logo is None:
            return
        lg = logo.copy()
        lg.thumbnail((800, 800), Image.LANCZOS)
        mask = lg.getchannel("A").point(lambda v: 30 if v > 40 else 0)  # silueta plana
        sil = Image.new("RGBA", lg.size, (44, 70, 138, 0))
        sil.putalpha(mask)
        self.img.paste(sil, (int(W / 2 - sil.width / 2), int(H * cy - sil.height / 2)), sil)

    def _logo(self, cx, cy, s):
        if not _paste_logo(self.img, cx, cy, s):
            _isotipo_vector(self.d, cx, cy, s)

    # ---- cabeceras ----
    def _header(self, kicker, n, total):
        d = self.d
        self._logo(158, 168, 140)
        d.text((248, 122), "EASY", font=F_DISPLAY(44), fill=PAPER)
        d.text((248, 174), "MELI", font=F_DISPLAY(44), fill=YELLOW)
        lab = F_MONO(30)
        if kicker:
            tw = d.textlength(kicker, font=lab)
            x1 = W - 90 - tw - 40
            d.rounded_rectangle([x1, 120, W - 90, 176], radius=8, fill=YELLOW)
            d.text((x1 + 20, 135), kicker, font=lab, fill=INK)
        c = f"{n:02d}/{total:02d}"
        d.text((W - 90 - d.textlength(c, font=F_MONO(28)), 196),
               c, font=F_MONO(28), fill=MUTED)

    def _brand_min(self):
        """Portada: solo logo chico + handle. Sin badge ni contador: el
        gancho se lleva el frame entero."""
        d = self.d
        self._logo(122, 132, 78)
        d.text((176, 104), "EASY MELI", font=F_DISPLAY(30), fill=PAPER)
        d.text((86, H - 120), "skool.com/easymeli", font=F_MONO(30), fill=MUTED)

    def _footer(self):
        d = self.d
        d.line([90, H - 130, W - 90, H - 130], fill=LINE, width=2)
        self._logo(112, H - 82, 54)
        d.text((150, H - 96), "skool.com/easymeli", font=F_MONO(26), fill=MUTED)

    # ---- helpers de texto ----
    def _wrap(self, text, font, maxw):
        words, lines, cur = text.split(), [], ""
        for w_ in words:
            t = (cur + " " + w_).strip()
            if self.d.textlength(t, font=font) <= maxw:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w_
        if cur:
            lines.append(cur)
        return lines

    def _fit_line(self, text, size, maxw=908, font=F_DISPLAY):
        """Baja el cuerpo hasta que la LÍNEA COMPLETA cabe en maxw."""
        while size > 30 and self.d.textlength(text, font=font(size)) > maxw:
            size -= 4
        return font(size)

    def block(self, text, font, x, y, maxw, fill, lh=1.05):
        for ln in self._wrap(text, font, maxw):
            if self.photo:
                self._shadow((x, y), ln, font, fill)
            else:
                self.d.text((x, y), ln, font=font, fill=fill)
            y += int(font.size * lh)
        return y

    def center(self, text, font, y, fill):
        self.d.text(((W - self.d.textlength(text, font=font)) / 2, y),
                    text, font=font, fill=fill)

    def cline(self, text, y, fill, size, maxw=908):
        """Línea centrada, auto-ajustada a maxw."""
        fnt = self._fit_line(text, size, maxw)
        self.d.text(((W - self.d.textlength(text, font=fnt)) / 2, y), text, font=fnt, fill=fill)
        return y + int(fnt.size)

    # ---- componentes de contenido ----
    def cover_threat(self, rows, y=None, size=150, lh=1.04):
        """Portada estilo AMENAZA: líneas apiladas a la izquierda, cada una
        auto-ajustada. rows = [(texto, 0|1)] donde 1 = amarillo (una sola).
        Sobre foto: arranca arriba (espacio negativo) y con sombra dura."""
        if y is None:
            y = 210 if self.photo else 470
        if self.photo:
            size = 118  # más contenido en el espacio superior, deja ver tu cara
        for txt, hot in rows:
            s = int(size * (1.4 if hot else 1.0))
            fnt = self._fit_line(txt, s)
            if self.photo:
                self._shadow((86, y), txt, fnt, (YELLOW if hot else PAPER))
            else:
                self.d.text((86, y), txt, font=fnt, fill=(YELLOW if hot else PAPER))
            y += int(fnt.size * lh)
        return y

    def hero_num(self, text, y=560, size=430, sub=None):
        self.center(text, F_DISPLAY(size), y, YELLOW)
        if sub:
            self.block(sub, F_BODY(84), 90, y + size + 60, 900, PAPER)

    def title(self, text, y=430, size=118, fill=PAPER, maxw=900):
        longest = max(text.split(), key=len)
        while size > 40 and self.d.textlength(longest, font=F_DISPLAY(size)) > maxw:
            size -= 4
        return self.block(text, F_DISPLAY(size), 90, y, maxw, fill, lh=1.02)

    def body(self, text, y, fill=None, size=76, maxw=900):
        return self.block(text, F_BODY(size), 90, y, maxw, fill or MUTED, lh=1.06)

    def rule(self, y):
        self.d.line([90, y, W - 90, y], fill=LINE, width=4)
        return y + 40

    def ledger(self, rows, y=680, total=None):
        mono = F_MONO(38)
        for left, right in rows:
            self.d.text((90, y), left, font=mono, fill=MUTED)
            self.d.text((W - 90 - self.d.textlength(right, font=mono), y),
                        right, font=mono, fill=PAPER)
            self.d.line([90, y + 64, W - 90, y + 64], fill=LINE, width=2)
            y += 104
        if total:
            y += 30
            big = F_DISPLAY(80)
            self.d.text((90, y), total[0], font=big, fill=PAPER)
            self.d.text((W - 90 - self.d.textlength(total[1], font=big), y),
                        total[1], font=big, fill=YELLOW)
            y += 170
        return y

    def task(self, text):
        y = H - 250
        self.d.rounded_rectangle([90, y, W - 90, y + 78], radius=10, outline=YELLOW, width=3)
        self.d.text((118, y + 22), text, font=F_MONO(28), fill=YELLOW)

    def save(self, name):
        os.makedirs(OUT, exist_ok=True)
        self.img.save(OUT + name)
        return OUT + name


# ============ Carrusel DESDE EL MISMO guion.json del video ============
# Un solo archivo de datos produce el video (Remotion) y el carrusel (Pillow):
# es la Fase 2 (repurposing). El guion.json vive en video-remotion/guiones/.
def _color(c):
    return {"yellow": YELLOW, "muted": MUTED, "paper": PAPER}.get(c, MUTED)


def carrusel_desde_guion(path, prefix=""):
    """Lee un guion.json (esquema del video) y genera el carrusel PNG,
    mapeando cada escena (layout) al componente Pillow equivalente. Devuelve
    la lista de archivos guardados, en orden."""
    with open(path, encoding="utf-8") as f:
        g = json.load(f)
    total = 1 + len(g["escenas"])
    saved = []

    # ¿Hay rostro generado para este guion? (public/carrusel-rostro/<nombre>-*)
    nombre = os.path.basename(path).replace(".json", "")
    face_dir = os.path.join("public", "carrusel-rostro")
    f_portada = os.path.join(face_dir, f"{nombre}-portada.png")
    f_cierre = os.path.join(face_dir, f"{nombre}-cierre.png")
    f_portada = f_portada if os.path.exists(f_portada) else None
    f_cierre = f_cierre if os.path.exists(f_cierre) else None

    # Slide 1 — portada AMENAZA (misma 2ª persona que frena el scroll).
    # Si hay rostro, tu cara es el fondo (gancho humano); si no, navy editorial.
    s = Slide(None, 1, total=total, cover=True, photo=f_portada)
    rows = [(ln["text"], 1 if ln.get("hot") else 0) for ln in g["portada"]["amenaza"]]
    s.cover_threat(rows)
    saved.append(s.save(f"{prefix}01-portada.png"))

    # Slides internas — una por escena, mapeando layout → componente.
    for i, e in enumerate(g["escenas"], start=2):
        layout0 = e["layout"]
        use_photo = f_cierre if layout0 == "cierre" else None
        s = Slide(e.get("kicker", ""), i, total=total, photo=use_photo)
        layout = e["layout"]
        if layout == "titulo-cuerpo":
            y = s.title(e["titulo"], y=440, size=120)
            s.body(e["cuerpo"], y + 60, fill=_color(e.get("cuerpoColor")), size=80)
        elif layout == "titulo-regla-cuerpo":
            y = s.title(e["titulo"], y=450, size=130)
            y = s.rule(y + 60)
            s.body(e["cuerpo"], y + 30, fill=_color(e.get("cuerpoColor")), size=80)
        elif layout == "desglose":
            s.title(e["titulo"], y=400, size=108)
            y = s.ledger([(a, b) for a, b in e["filas"]], y=700, total=tuple(e["total"]))
            if e.get("cuerpo"):
                s.body(e["cuerpo"], y, fill=_color(e.get("cuerpoColor")), size=74)
        elif layout == "cierre":
            # sobre foto: texto compacto y arriba (zona oscura) → no pisa tu cara
            ty, tsz, gap = (150, 78, 14) if s.photo else (460, 104, 30)
            y = s.title(e["titulo"], y=ty, size=tsz)
            s.title(e["titulo2"], y=y + gap, size=tsz, fill=YELLOW)
            s.task(e["tarea"])
        elif layout == "numero":
            s.hero_num(e["numero"], y=560, sub=e.get("caption"))
        elif layout == "cita":
            y = s.title(f'"{e["texto"]}"', y=460, size=96)
            s.body(f'— {e["autor"]}', y + 60, fill=MUTED, size=64)
        saved.append(s.save(f"{prefix}{i:02d}-{layout}.png"))

    return saved


# ============ EJEMPLO: carrusel de cupones acumulables ============
# Uso: python generar_carrusel.py [guion.json]
#   - con argumento  → genera el carrusel desde ese guion (Fase 2).
#   - sin argumento  → corre el demo hardcodeado de abajo.
# Adapta el contenido manteniendo los componentes. Slide 1 = portada AMENAZA.
if len(sys.argv) > 1 and sys.argv[1].endswith(".json"):
    _out = carrusel_desde_guion(sys.argv[1])
    print("ok", [os.path.basename(p) for p in _out])
    sys.exit(0)

if __name__ == "__main__":
    # 1 — PORTADA (amenaza en 2ª persona: frena el scroll)
    s = Slide(None, 1, cover=True)
    s.cover_threat([("ESTÁS", 0), ("REGALANDO", 0),
                    ("UN 20%", 1), ("Y NO LO", 0), ("SABES", 0)])
    s.save("01-portada.png")

    # 2 — mecanismo
    s = Slide("EL MECANISMO", 2)
    y = s.title("EL CUPÓN ES ACUMULABLE", y=440, size=124)
    s.body("Se suma a la promoción que ya tenías corriendo en central de promociones.",
           y + 70, fill=YELLOW, size=80)
    s.save("02-mecanismo.png")

    # 3 — desglose
    s = Slide("LO QUE PASA", 3)
    s.title("EN LA MISMA VENTA", y=400, size=110)
    y = s.ledger([("PROMOCIÓN ACTIVA", "-10%"),
                  ("CUPÓN DE SEGUIDOR", "-10%")],
                 y=700, total=("SALE", "-20%"))
    s.body("De tu margen, no del de MercadoLibre.", y, fill=MUTED, size=76)
    s.save("03-desglose.png")

    # 4 — por qué
    s = Slide("POR QUÉ PASA", 4)
    y = s.title("NADIE TE AVISA", y=450, size=136)
    y = s.rule(y + 70)
    s.body("Creaste el cupón en un lado y la promoción en otro. La plataforma no te lo suma en pantalla.",
           y + 40, fill=YELLOW, size=80)
    s.save("04-por-que.png")

    # 5 — dónde duele
    s = Slide("DÓNDE DUELE", 5)
    y = s.title("EN CATEGORÍAS DE MARGEN CHICO TE COME LA VENTA COMPLETA", y=420, size=98)
    s.body("Supermercado. Mascotas. Suplementos. Ahí se margina en monedas.",
           y + 70, fill=MUTED, size=78)
    s.save("05-donde-duele.png")

    # 6 — cierre
    s = Slide("QUÉ HACER", 6)
    y = s.title("NO PONGAS CUPÓN A TODAS TUS PUBLICACIONES.", y=470, size=104)
    s.title("REVISA CUÁLES YA TIENEN PROMOCIÓN.", y=y + 40, size=104, fill=YELLOW)
    s.task("ANDA A REVISAR TUS CUPONES ACTIVOS")
    s.save("06-cierre.png")

    print("ok", sorted(os.listdir(OUT)))
