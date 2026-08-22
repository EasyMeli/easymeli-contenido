#!/usr/bin/env python3
# RECORTE DE PERSONA (efecto "objetos detrás") — corre 100% local, sin tokens.
# Toma el clip combinado y genera un video del PRESENTADOR con fondo TRANSPARENTE
# (webm VP9 con alfa). Luego VideoHablado lo pone ENCIMA de los objetos, así los
# objetos quedan DETRÁS de la persona (no le tapan la cara).
#
# Uso: python3 scripts/recorte-persona.py <entrada.mp4> <salida.webm>
# Requiere: mediapipe, opencv, y ffmpeg del sistema.
import sys, os, subprocess, urllib.request

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "selfie_segmenter.tflite")

def log(m): print(f"  [recorte] {m}", flush=True)

def asegurar_modelo():
    if os.path.exists(MODEL_PATH):
        return
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    log("descargando modelo de recorte (una sola vez)…")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)

def main():
    if len(sys.argv) < 3:
        print("Uso: recorte-persona.py <entrada> <salida.webm>"); sys.exit(1)
    entrada, salida = sys.argv[1], sys.argv[2]
    asegurar_modelo()

    import cv2, numpy as np
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision

    cap = cv2.VideoCapture(entrada)
    if not cap.isOpened():
        print(f"No pude abrir {entrada}"); sys.exit(1)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    log(f"{w}x{h} @ {fps:.2f}fps, {total} frames")

    opts = vision.ImageSegmenterOptions(
        base_options=python.BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=vision.RunningMode.VIDEO,
        output_confidence_masks=True,
        output_category_mask=False,
    )
    seg = vision.ImageSegmenter.create_from_options(opts)

    # ffmpeg recibe frames RGBA crudos por stdin → webm VP9 con alfa
    ff = subprocess.Popen([
        "ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
        "-s", f"{w}x{h}", "-r", f"{fps}", "-i", "-",
        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "28",
        "-auto-alt-ref", "0", salida,
    ], stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    i = 0
    while True:
        ok, frame_bgr = cap.read()
        if not ok:
            break
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        ts = int(i * (1000.0 / fps))
        res = seg.segment_for_video(mp_img, ts)
        mask = res.confidence_masks[0].numpy_view()  # 0..1 confianza de persona
        alpha = np.clip(mask * 255.0, 0, 255).astype(np.uint8).reshape(h, w, 1)
        rgba = np.concatenate([rgb, alpha], axis=2)
        ff.stdin.write(rgba.tobytes())
        i += 1
        if total and i % 60 == 0:
            log(f"{i}/{total}")
    cap.release()
    ff.stdin.close()
    ff.wait()
    log(f"listo → {salida} ({i} frames)")

if __name__ == "__main__":
    main()
