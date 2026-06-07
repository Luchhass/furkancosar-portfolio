import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = "Furkan Cosar frontend developer portfolio preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const heroWords = ["Creative", "Frontend"];
const stackItems = ["React", "Next.js", "GSAP", "Tailwind"];
const panelItems = [
  ["Focus", "Responsive animated interfaces"],
  ["Role", "Frontend developer"],
  ["Build", "React, Next.js and GSAP"],
];
const bandWords = Array.from({ length: 6 }, (_, index) => index);
const heavyOffsets = [
  [0, 0],
  [-0.9, 0],
  [0.9, 0],
  [0, -0.9],
  [0, 0.9],
];

function HeavyText({ children, gradient, style }) {
  const layerStyle = gradient ? {
    position: "absolute",
    inset: 0,
    display: "flex",
    background: gradient,
    backgroundClip: "text",
    color: "transparent",
  } : {
    position: "absolute",
    inset: 0,
    display: "flex",
    color: style.color || "#ffffff",
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        ...style,
      }}
    >
      <span style={{ display: "flex", opacity: 0 }}>{children}</span>

      {heavyOffsets.map(([x, y], index) => (
        <span
          key={index}
          style={{
            ...layerStyle,
            transform: `translate(${x}px, ${y}px)`,
          }}
        >
          {children}
        </span>
      ))}
    </div>
  );
}

export default function Image() {
  const hostname = new URL(siteConfig.url).hostname;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#050505",
          color: "#ffffff",
          fontFamily: "Impact, Arial Black, Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 860,
            height: 526,
            display: "flex",
            background: "#050505",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 340,
            height: 526,
            display: "flex",
            background: "#f6f5f1",
            color: "#080808",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 104,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            background: "linear-gradient(90deg,#6f5cff,#9b43ed,#cf3d9f,#ee4b67)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 44,
              marginLeft: -44,
              whiteSpace: "nowrap",
            }}
          >
            {bandWords.map((index) => (
              <HeavyText
                key={index}
                style={{
                  color: "#ffffff",
                  fontSize: 82,
                  fontWeight: 900,
                  letterSpacing: "-.024em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                {siteConfig.brand}
              </HeavyText>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 74,
            left: 50,
            width: 760,
            height: 388,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {heroWords.map((word) => (
            <HeavyText
              key={word}
              style={{
                  color: "#ffffff",
                  fontSize: 116,
                  fontWeight: 900,
                  letterSpacing: "-.038em",
                  lineHeight: 0.82,
                  textTransform: "uppercase",
                }}
            >
              {word}
            </HeavyText>
          ))}

          <HeavyText
            gradient="linear-gradient(90deg,#745cff,#a83ee1,#e04b88)"
            style={{
              marginTop: 12,
              color: "transparent",
              fontSize: 118,
              fontWeight: 900,
              letterSpacing: "-.038em",
              lineHeight: 0.88,
              textTransform: "uppercase",
            }}
          >
            Developer
          </HeavyText>
        </div>

        <div
          style={{
            position: "absolute",
            right: 40,
            top: 44,
            width: 260,
            height: 404,
            display: "flex",
            flexDirection: "column",
            color: "#050505",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              paddingBottom: 24,
              borderBottom: "1px solid rgba(0,0,0,.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".16em",
                  color: "rgba(0,0,0,.45)",
                  textTransform: "uppercase",
                }}
              >
                {hostname}
              </span>
              <span
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 38,
                  fontWeight: 900,
                  letterSpacing: "-.06em",
                  lineHeight: 1,
                }}
              >
                2026
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 58,
                height: 58,
                borderRadius: 999,
                background: "#050505",
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              FC
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: 26,
            }}
          >
            {panelItems.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingBottom: 18,
                  marginBottom: 18,
                  borderBottom: "1px solid rgba(0,0,0,.1)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: ".18em",
                    color: "rgba(0,0,0,.42)",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    display: "flex",
                    marginTop: 8,
                    fontSize: 17,
                    fontWeight: 900,
                    letterSpacing: "-.015em",
                    lineHeight: 1.08,
                    textTransform: "uppercase",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            {stackItems.map((item) => (
              <span
                key={item}
                style={{
                  display: "flex",
                  border: "1px solid rgba(0,0,0,.14)",
                  padding: "9px 11px",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
