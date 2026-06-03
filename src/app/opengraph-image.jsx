import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = "Furkan Cosar frontend developer portfolio preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#09090a",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(103,104,255,.16), transparent 34%), linear-gradient(315deg, rgba(238,75,103,.14), transparent 38%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: -210,
            right: -160,
            width: 560,
            height: 560,
            border: "2px solid rgba(255,255,255,.16)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 74,
            bottom: -250,
            width: 620,
            height: 620,
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "50%",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "72px 82px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#6768ff,#a53cdd,#ee4b67)",
                }}
              />
              {siteConfig.brand}
            </div>

            <div
              style={{
                border: "1px solid rgba(255,255,255,.16)",
                padding: "16px 22px",
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.82)",
              }}
            >
              Frontend Portfolio
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: 880,
              }}
            >
              <div
                style={{
                  fontSize: 132,
                  fontWeight: 900,
                  letterSpacing: "-0.065em",
                  lineHeight: 0.82,
                  textTransform: "uppercase",
                }}
              >
                Furkan
              </div>
              <div
                style={{
                  fontSize: 132,
                  fontWeight: 900,
                  letterSpacing: "-0.065em",
                  lineHeight: 0.82,
                  textTransform: "uppercase",
                }}
              >
                Cosar
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginTop: 34,
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ee4b67",
              }}
            >
              React
              <span style={{ color: "rgba(255,255,255,.26)" }}>•</span>
              Next.js
              <span style={{ color: "rgba(255,255,255,.26)" }}>•</span>
              GSAP
              <span style={{ color: "rgba(255,255,255,.26)" }}>•</span>
              UI Motion
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 40,
              borderTop: "1px solid rgba(255,255,255,.12)",
              paddingTop: 26,
              color: "rgba(255,255,255,.72)",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.03em",
            }}
          >
            <span>Responsive websites and polished digital interfaces.</span>
            <span>{new URL(siteConfig.url).hostname}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
