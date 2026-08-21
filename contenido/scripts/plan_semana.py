"""Plan de la semana — Fase 3 (calendario con variedad forzada).

Arma 4-5 piezas balanceando las 6 formas, los 5 terrenos y los 4 presets,
sin repetir forma ni preset en días seguidos. Lee la bitácora para (a) no
arrancar la semana con la misma forma/preset que la última pieza, y (b)
priorizar lo que ya trajo DMs concretos/signups cuando haya datos.

Por qué: el crecimiento es cadencia, no picos. Este plan mata el bloqueo de
"¿qué subo hoy?" y garantiza que no te vuelvas monótono.

Uso:
    python3 plan_semana.py                 # semana actual (ISO), lee la bitácora
    python3 plan_semana.py --semana 34     # fuerza un nº de semana (para rotar)
    python3 plan_semana.py --piezas 4      # 4 o 5 piezas (default 5)
    python3 plan_semana.py --out out/plan.md
"""
import sys
import os
import re
import datetime

SK = os.path.expanduser("~/.claude/skills/contenido")
BITACORA = os.path.join(SK, "references", "bitacora.md")

# --- catálogos (ver formas.md / contexto.md / video.md) -------------------
FORMAS = {
    "A": "Te está pasando y no lo sabes",
    "B": "Lo que parece inteligente y no lo es",
    "C": "Dos casos, mismo escenario, final distinto",
    "D": "El número que nadie te dice",
    "E": "Por qué el sistema es así",
    "F": "Me pasó a mí",
}
# C y F son las mejores pero las más caras/limitadas: no gastarlas de a dos.
CARAS = {"C", "F"}
TERRENOS = {
    1: "Marca e INAPI",
    2: "Cómo piensa el algoritmo",
    3: "Plata que se pierde sin verlo",
    4: "Errores de diagnóstico",
    5: "Operación y tributario (Chile)",
}
# Afinidad forma → preset (look de la portada) y forma → terreno sugerido.
PRESET_POR_FORMA = {"A": "amenaza", "B": "aurora", "C": "split", "D": "numero", "E": "aurora", "F": "split"}
PRESETS = ["amenaza", "numero", "split", "aurora"]
TERRENO_AFIN = {"A": 3, "B": 4, "C": 1, "D": 2, "E": 5, "F": 1}
DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]


# --- lectura de la bitácora ----------------------------------------------
def leer_bitacora(path):
    """Devuelve (ultima_forma, ultimo_preset, score_forma) de las filas."""
    filas = []
    if not os.path.exists(path):
        return None, None, {}
    with open(path, encoding="utf-8") as f:
        for ln in f:
            if re.match(r"\|\s*20\d\d-\d\d-\d\d", ln):
                filas.append([c.strip() for c in ln.strip().strip("|").split("|")])
    if not filas:
        return None, None, {}
    score = {}
    for r in filas:
        # columnas: 0 fecha 1 pieza 2 forma 3 terreno 4 preset 5 formato 6 hook
        #           7 vistas 8 ret 9 guard 10 dms(v/c) 11 signups ...
        forma = (r[2] if len(r) > 2 else "").split("/")[0].strip().upper()
        concretos = 0
        if len(r) > 10 and "/" in r[10]:
            try:
                concretos = int(r[10].split("/")[1])
            except ValueError:
                concretos = 0
        signups = 0
        if len(r) > 11:
            try:
                signups = int(r[11])
            except ValueError:
                signups = 0
        if forma in FORMAS:
            score[forma] = score.get(forma, 0) + concretos * 2 + signups * 3
    ultima = filas[-1]
    uf = (ultima[2] if len(ultima) > 2 else "").split("/")[0].strip().upper()
    up = (ultima[4] if len(ultima) > 4 else "").strip().lower()
    return (uf if uf in FORMAS else None), (up if up in PRESETS else None), score


# --- armado de la semana --------------------------------------------------
def elegir_formas(semana, piezas, ultima_forma, score):
    """Regla base: una A, una C|F, una D, una B|E, + comodín opcional.
    Rota C/F y B/E por semana; evita arrancar con la forma de la última pieza."""
    cf = "C" if semana % 2 == 0 else "F"          # una sola de las caras
    be = "E" if semana % 3 == 0 else "B"          # E solo de vez en cuando
    base = ["A", cf, "D", be]
    if piezas >= 5:
        # 5º = comodín: la forma con mejor score (si hay datos), sin ser cara
        # (para no quemar C/F) y sin duplicar la ya elegida. Sin datos, la otra
        # de B/E, para tener 5 formas distintas (máxima variedad).
        cand = [f for f in sorted(score, key=score.get, reverse=True)
                if f not in base and f not in CARAS and score.get(f, 0) > 0]
        if cand:
            base.append(cand[0])
        else:
            base.append("E" if be == "B" else "B")
    # ordenar para que la 1ª no sea la misma forma que la última pieza publicada
    orden = _ordenar_sin_repetir(base, ultima_forma)
    return orden


def _ordenar_sin_repetir(formas, ultima):
    """Ordena evitando dos formas iguales seguidas y que la 1ª == última."""
    import itertools
    mejor = formas[:]
    for perm in itertools.permutations(formas):
        ok = all(perm[i] != perm[i - 1] for i in range(1, len(perm)))
        if ok and (ultima is None or perm[0] != ultima):
            return list(perm)
    return mejor


def asignar_presets(formas):
    """Preset por afinidad de forma; corrige colisiones consecutivas."""
    out = []
    for i, f in enumerate(formas):
        p = PRESET_POR_FORMA[f]
        if i > 0 and p == out[-1]:
            alt = [x for x in PRESETS if x != out[-1]]
            p = alt[i % len(alt)]
        out.append(p)
    return out


def asignar_terrenos(formas):
    """Terreno por afinidad, sin repetir dentro de la semana si se puede."""
    usados, out = set(), []
    for f in formas:
        t = TERRENO_AFIN[f]
        if t in usados:
            libres = [x for x in TERRENOS if x not in usados]
            t = libres[0] if libres else t
        usados.add(t)
        out.append(t)
    return out


def asignar_formatos(n):
    """Mezcla de formatos: video capta, carrusel alcanza, corto calienta,
    post profundiza en Skool. La última suele ser un repurpose (gratis)."""
    base = ["video", "corto", "carrusel", "video", "post"]
    return base[:n]


def plan(semana, piezas, path=BITACORA):
    uf, up, score = leer_bitacora(path)
    formas = elegir_formas(semana, piezas, uf, score)
    presets = asignar_presets(formas)
    terrenos = asignar_terrenos(formas)
    formatos = asignar_formatos(len(formas))

    L = [f"# Plan de la semana {semana}", ""]
    if uf or up:
        L.append(f"_Última pieza registrada: forma {uf or '?'}, preset {up or '?'} "
                 f"→ la semana no arranca con eso._")
    if score:
        top = sorted(score, key=score.get, reverse=True)
        top = [f for f in top if score[f] > 0]
        if top:
            L.append(f"_Lo que más rindió hasta ahora (DMs concretos/signups): "
                     f"forma {', '.join(top)}._")
    L += ["", "| Día | Forma | Qué es | Terreno | Preset | Formato |",
          "|---|---|---|---|---|---|"]
    for i, f in enumerate(formas):
        L.append(f"| {DIAS[i]} | {f} | {FORMAS[f]} | {terrenos[i]} · {TERRENOS[terrenos[i]]} "
                 f"| {presets[i]} | {formatos[i]} |")

    L += ["", "## Recordatorios", ""]
    caras = [f for f in formas if f in CARAS]
    if caras:
        L.append(f"- Forma **{', '.join(caras)}** (la mejor pero cara/limitada): "
                 f"una sola esta semana, no la quemes. Requiere capturas reales "
                 f"(C) o historia propia (F) — no se fabrica.")
    if "E" in formas:
        L.append("- Forma **E** es expositiva y débil: va intercalada, nunca dos "
                 "veces en la misma semana.")
    if len(formas) >= 5 and formatos[-1] in ("carrusel", "corto", "post"):
        L.append(f"- La pieza del **{DIAS[len(formas) - 1]}** ({formatos[-1]}) puede "
                 f"ser un **repurpose** de otra del mismo `guion.json` (gratis): "
                 f"`python3 scripts/generar_carrusel.py`, `--corto`, o `post_skool.py`.")
    L.append("- Nunca dos formas ni dos presets iguales en días seguidos (ya está "
             "resuelto arriba).")
    L.append("- Al publicar cada pieza → agregá su fila a `bitacora.md`.")
    return "\n".join(L)


if __name__ == "__main__":
    args = sys.argv[1:]

    def _flag(name, default=None):
        return args[args.index(name) + 1] if name in args else default

    semana = int(_flag("--semana", datetime.date.today().isocalendar()[1]))
    piezas = int(_flag("--piezas", 5))
    piezas = max(4, min(5, piezas))
    texto = plan(semana, piezas)
    if "--out" in args:
        dest = _flag("--out")
        os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(texto)
        print("ok", dest)
    else:
        print(texto)
