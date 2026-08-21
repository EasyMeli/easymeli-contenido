import React from "react";
import { BRAND, FONTS } from "./brand";
import { SceneBg, Header, Footer, Stage, Reveal, MARGIN } from "./ui";
import { Title, Body, Rule, Row, BigNumber, Quote, colorOf } from "./scenes";
import { AssetLayer } from "./assets";
import { EscenaData } from "./guion";

// Renderer: convierte una escena de datos (del guion.json) en una escena
// renderizada, según su `layout`. Acá se mapea layout → ladrillos.
export const Escena: React.FC<{ data: EscenaData; n: number; total?: number }> = ({ data, n, total }) => {
  switch (data.layout) {
    case "titulo-cuerpo":
      return (
        <SceneBg>
          <Header kicker={data.kicker} n={n} total={total} />
          <Stage gap={54}>
            <Title text={data.titulo} size={124} />
            <Body text={data.cuerpo} color={colorOf(data.cuerpoColor)} size={82} />
          </Stage>
          {data.asset && (
            <AssetLayer src={data.asset.src} x={data.asset.x} y={data.asset.y} w={data.asset.w} delay={12} floaty parallax={26} />
          )}
          <Footer />
        </SceneBg>
      );

    case "titulo-regla-cuerpo":
      return (
        <SceneBg>
          <Header kicker={data.kicker} n={n} total={total} />
          <Stage gap={48}>
            <Title text={data.titulo} size={136} />
            <Rule delay={10} />
            <Body text={data.cuerpo} color={colorOf(data.cuerpoColor)} size={82} delay={16} />
          </Stage>
          <Footer />
        </SceneBg>
      );

    case "desglose": {
      const base = 8;
      const lastDelay = base + data.filas.length * 8 + 2;
      return (
        <SceneBg>
          <Header kicker={data.kicker} n={n} total={total} />
          <Stage gap={44}>
            <Title text={data.titulo} size={110} />
            {/* ancho acotado: los montos a la derecha no caen bajo los botones de TikTok */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28, width: 720 }}>
              {data.filas.map((f, i) => (
                <Row key={i} left={f[0]} right={f[1]} delay={base + i * 8} />
              ))}
              <Row left={data.total[0]} right={data.total[1]} delay={lastDelay} big />
            </div>
            {data.cuerpo && <Body text={data.cuerpo} color={colorOf(data.cuerpoColor)} size={76} delay={lastDelay + 8} />}
          </Stage>
          <Footer />
        </SceneBg>
      );
    }

    case "cierre":
      return (
        <SceneBg>
          <Header kicker={data.kicker} n={n} total={total} />
          <Stage gap={40} justify="flex-start">
            <Title text={data.titulo} size={128} />
            <Title text={data.titulo2} size={110} color={BRAND.yellow} delay={12} />
          </Stage>
          <Reveal delay={24} style={{ position: "absolute", left: MARGIN, top: 1420, width: 740 }}>
            <div style={{ boxSizing: "border-box", width: "100%", border: `3px solid ${BRAND.yellow}`, borderRadius: 10, padding: "22px 28px" }}>
              <div style={{ color: BRAND.yellow, fontFamily: FONTS.mono, fontSize: 28 }}>{data.tarea}</div>
            </div>
          </Reveal>
          <Footer />
        </SceneBg>
      );

    case "numero":
      return <BigNumber kicker={data.kicker} n={n} total={total} label={data.label} number={data.numero} caption={data.caption} />;

    case "cita":
      return <Quote kicker={data.kicker} n={n} total={total} text={data.texto} author={data.autor} />;
  }
};
