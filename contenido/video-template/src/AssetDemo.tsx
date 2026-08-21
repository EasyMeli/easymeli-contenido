import React from "react";
import { BRAND, FONTS } from "./brand";
import { SceneBg, Header, Footer, Stage } from "./ui";
import { AssetLayer } from "./assets";

// DEMO del híbrido Canva + Remotion: un asset (acá el logo como stand-in;
// en real sería un PNG transparente de canva/) se coloca como capa
// animada, y el texto se anima por código encima.
export const AssetDemo: React.FC = () => (
  <SceneBg>
    <Header kicker="ASSET DEMO" n={3} />
    {/* capa de asset traída de Canva: flota + entra con escala */}
    <AssetLayer src="logo.png" x={620} y={780} w={360} delay={6} floaty parallax={30} />
    <Stage gap={44}>
      <div style={{ color: BRAND.paper, fontSize: 120, lineHeight: 1.02 }}>
        EL ASSET DE CANVA
      </div>
      <div style={{ color: BRAND.yellow, fontFamily: FONTS.body, fontSize: 82, lineHeight: 1.06 }}>
        entra como capa y el texto se anima encima.
      </div>
    </Stage>
    <Footer />
  </SceneBg>
);
