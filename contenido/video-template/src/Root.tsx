import React from "react";
import { Composition } from "remotion";
import { Carrusel, CARRUSEL_DURATION, CUPONES, durationOf } from "./Carrusel";
import { Corto, CORTO_DURATION, cortoDurationOf } from "./Corto";
import { AssetDemo } from "./AssetDemo";
import { FloatDemo } from "./FloatDemo";
import { VideoHablado, videoHabladoDuration, TEXTOS_DEFAULT, videoHabladoSchema } from "./VideoHablado";
import { BigNumber, Quote } from "./scenes";
import { PRESETS } from "./presets";
import { parseGuion } from "./guion";
// LottieIcon (src/LottieIcon.tsx) está listo para reproducir un .json
// válido en public/lottie/ (de LottieFiles). Se usa como AssetLayer.

// Una composición por preset: se previsualizan y renderizan por separado.
// Regla: nunca dos videos seguidos con el mismo preset.
export const RemotionRoot: React.FC = () => (
  <>
    {/* Composición genérica: el script scripts/nuevo-video.mjs le pasa un
        guion por --props y ella calcula su duración sola (calculateMetadata).
        Así se renderiza cualquier guion sin agregar una composición nueva. */}
    <Composition
      id="Carrusel"
      component={Carrusel}
      durationInFrames={CARRUSEL_DURATION}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ presetKey: "amenaza" as keyof typeof PRESETS, guion: CUPONES }}
      calculateMetadata={({ props }) => {
        const g = parseGuion(props.guion ?? CUPONES, "guion (props)");
        return { durationInFrames: durationOf(g), props: { ...props, guion: g } };
      }}
    />
    {/* Corto de ~10s: mismo guion recortado (portada + golpe + cierre). */}
    <Composition
      id="Corto"
      component={Corto}
      durationInFrames={CORTO_DURATION}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ presetKey: "amenaza" as keyof typeof PRESETS, guion: CUPONES }}
      calculateMetadata={({ props }) => {
        const g = parseGuion(props.guion ?? CUPONES, "guion (props)");
        return { durationInFrames: cortoDurationOf(g), props: { ...props, guion: g } };
      }}
    />
    {Object.keys(PRESETS).map((key) => (
      <Composition
        key={key}
        id={`Carrusel-${PRESETS[key].name}`}
        component={Carrusel}
        durationInFrames={CARRUSEL_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ presetKey: key as keyof typeof PRESETS }}
      />
    ))}
    <Composition
      id="AssetDemo"
      component={AssetDemo}
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="FloatDemo"
      component={FloatDemo}
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1920}
    />
    {/* Fase 6: video hablado (footage del usuario editado). footageFrames se
        calcula de la duración del clip; acá el de prueba (cupones, 3.1s≈93f). */}
    <Composition
      id="VideoHablado"
      component={VideoHablado}
      schema={videoHabladoSchema}
      durationInFrames={videoHabladoDuration(1058, true)}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{"textos":{"tituloArriba":"VENDES EN MERCADOLIBRE","tituloAbajo":"Y TU MARGEN NO CIERRA","placa":"-20%","alturaSubtitulos":300,"tamanoLetra":70,"estiloSubtitulos":"limpio" as const,"estiloCamara":"auto" as const,"vibe":"auto" as const},"footage":"grabaciones/cupones.mp4","footageFrames":1058,"introArchivo":"ai/cupones-intro.png","captionsFile":"captions/cupones.json","capturaArchivo":"","capturaTargetX":0.5,"capturaTargetY":0.42,"reglasExtra":"[]"}}
      calculateMetadata={({ props }) => ({
        durationInFrames: videoHabladoDuration(props.footageFrames, Boolean(props.introArchivo)),
      })}
    />
    <Composition
      id="DemoNumero"
      component={BigNumber}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        kicker: "EL NÚMERO",
        n: 3,
        label: "APARICIONES SIN ANUNCIAR",
        number: "5%",
        caption: "Ganas el catálogo y casi no te ven.",
      }}
    />
    <Composition
      id="DemoQuote"
      component={Quote}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        kicker: "CASO REAL",
        n: 5,
        text: "Me denunció Nike por una imagen que yo no hice.",
        author: "un amigo, vendedor de calzado",
      }}
    />
  </>
);
