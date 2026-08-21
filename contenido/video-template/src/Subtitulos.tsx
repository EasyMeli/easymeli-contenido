import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { BRAND, FONTS } from "./brand";
import { MARGIN } from "./ui";

// ─────────────────────────────────────────────────────────────────────────
// AJUSTES RÁPIDOS DE LOS SUBTÍTULOS (cambiá estos números y listo)
export const SUBS = {
  BOTTOM: 360, // altura desde abajo (MÁS grande = más arriba). 360 = tercio inferior, no tapa la cara
  FONT: 60, // tamaño de letra
  PALABRAS_MS: 650, // menos = menos palabras por pantalla (más "limpio"/tendencia)
  ESTILO: "limpio" as "limpio" | "resaltado", // "limpio" = blanco con pop; "resaltado" = caja amarilla
};
// ─────────────────────────────────────────────────────────────────────────

// Subtítulos estilo TikTok. "limpio": pocas palabras, blancas, la activa se
// agranda y se pone amarilla (sin caja) → look tendencia. "resaltado": caja
// amarilla en la palabra activa (más marcado).
export const Subtitulos: React.FC<{
  captions: Caption[];
  combine?: number;
  bottom?: number;
  font?: number;
  estilo?: "limpio" | "resaltado";
}> = ({ captions, combine = SUBS.PALABRAS_MS, bottom = SUBS.BOTTOM, font = SUBS.FONT, estilo = SUBS.ESTILO }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const { pages } = createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: combine });
  const page = pages.find((p) => ms >= p.startMs && ms < p.startMs + p.durationMs);
  if (!page) return null;

  return (
    <div style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom, textAlign: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px 22px", lineHeight: 1.15 }}>
        {page.tokens.map((t, i) => {
          const active = ms >= t.fromMs && ms < t.toMs + 60;
          const base: React.CSSProperties = {
            display: "inline-block",
            transformOrigin: "center",
            fontFamily: FONTS.display,
            fontSize: font,
          };
          if (estilo === "resaltado") {
            return (
              <span
                key={i}
                style={{
                  ...base,
                  color: active ? BRAND.ink : BRAND.paper,
                  background: active ? BRAND.yellow : "transparent",
                  padding: active ? "2px 14px" : "2px 2px",
                  borderRadius: 10,
                  transform: active ? "scale(1.05)" : "scale(1)",
                  textShadow: active ? "none" : "0 4px 12px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.9)",
                }}
              >
                {t.text.trim()}
              </span>
            );
          }
          // "limpio" (tendencia): blanco, palabra activa amarilla y un poco más grande, sin caja
          return (
            <span
              key={i}
              style={{
                ...base,
                color: active ? BRAND.yellow : BRAND.paper,
                // sin escala por-palabra: el énfasis es el color amarillo. (escalar
                // ensanchaba la palabra activa y la pegaba a la vecina)
                transform: "scale(1)",
                // contorno oscuro para que se lea nítido sobre cualquier video
                textShadow: "0 3px 10px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,1), 2px 2px 0 rgba(0,0,0,0.9)",
                transition: "none",
              }}
            >
              {t.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};
