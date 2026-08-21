import { staticFile, delayRender, continueRender, cancelRender } from "remotion";

// Registra las fuentes locales (mismas .ttf de la skill, copiadas a public/fonts)
// y ESPERA a que carguen antes de renderizar. Esto es clave: measureText
// (ui.tsx) mide el ancho del texto para ajustarlo al margen; si mide antes de
// que ArchivoBlack (una fuente muy ancha) cargue, usa una de reemplazo más
// angosta, calcula un tamaño demasiado grande, y el texto real se sale del
// margen. delayRender/continueRender frena el render hasta tener las fuentes.
let loaded = false;
export const loadFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;

  const faces: [string, string][] = [
    ["ArchivoBlack", "fonts/ArchivoBlack-Regular.ttf"],
    ["BarlowCondensed", "fonts/BarlowCondensed-Bold.ttf"],
    ["SpaceMono", "fonts/SpaceMono-Bold.ttf"],
  ];

  const handle = delayRender("Cargando fuentes de la marca");
  Promise.all(
    faces.map(([name, path]) => {
      const face = new FontFace(name, `url(${staticFile(path)}) format('truetype')`, {
        weight: "normal",
        display: "block",
      });
      return face.load().then((f) => {
        document.fonts.add(f);
      });
    })
  )
    .then(() => continueRender(handle))
    .catch((e) => cancelRender(e));
};
