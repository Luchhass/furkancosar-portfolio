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
  ["Focus", "Animated responsive interfaces"],
  ["Role", "Frontend developer"],
  ["Build", "Modern UI systems"],
];
const bandWords = Array.from({ length: 6 }, (_, index) => index);

function HexPattern() {
  const cells = [];
  const width = 76;
  const height = 66;
  const xStep = 74;
  const yStep = 55;

  for (let row = -1; row < 10; row += 1) {
    for (let column = -1; column < 14; column += 1) {
      const x = column * xStep + (row % 2 ? xStep / 2 : 0);
      const y = row * yStep;
      const shade = 14 + ((row * 7 + column * 11) % 22);

      cells.push(
        <polygon
          key={`${row}-${column}`}
          points={`${x + width / 2},${y} ${x + width},${y + height * 0.25} ${x + width},${y + height * 0.75} ${x + width / 2},${y + height} ${x},${y + height * 0.75} ${x},${y + height * 0.25}`}
          fill={`rgb(${shade},${shade},${shade + 2})`}
          stroke="rgba(255,255,255,.045)"
          strokeWidth="1"
        />,
      );
    }
  }

  return (
    <svg
      width="860"
      height="526"
      viewBox="0 0 860 526"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0.94,
      }}
    >
      <rect width="860" height="526" fill="#070707" />
      {cells}
      <rect
        width="860"
        height="526"
        fill="url(#heroShade)"
        opacity=".92"
      />
      <defs>
        <radialGradient id="heroShade" cx="50%" cy="48%" r="70%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="62%" stopColor="rgba(0,0,0,.16)" />
          <stop offset="100%" stopColor="rgba(0,0,0,.76)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

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
          background: "#050505",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 0,
            left: 0,
            width: 860,
            height: 526,
            overflow: "hidden",
            background: "#050505",
          }}
        >
          <HexPattern />
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 340,
            height: 526,
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
              gap: 54,
              marginLeft: -46,
              whiteSpace: "nowrap",
            }}
          >
            {bandWords.map((index) => (
              <span
                key={index}
                style={{
                  display: "flex",
                  color: "#ffffff",
                  fontSize: 78,
                  fontWeight: 900,
                  letterSpacing: "-.055em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                {siteConfig.brand}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 54,
            left: 64,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 21,
            fontWeight: 900,
            letterSpacing: ".14em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "linear-gradient(135deg,#6768ff,#a53cdd,#ee4b67)",
            }}
          />
          {siteConfig.brand}
        </div>

        <div
          style={{
            position: "absolute",
            top: 96,
            left: 54,
            width: 752,
            height: 352,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {heroWords.map((word) => (
            <div
              key={word}
              style={{
                display: "flex",
                color: "#ffffff",
                fontSize: 104,
                fontWeight: 900,
                letterSpacing: "-.07em",
                lineHeight: 0.84,
                textTransform: "uppercase",
              }}
            >
              {word}
            </div>
          ))}

          <div
            style={{
              display: "flex",
              marginTop: 7,
              background: "linear-gradient(90deg,#7657ff,#a63ddd,#e24b85)",
              backgroundClip: "text",
              color: "transparent",
              fontSize: 106,
              fontWeight: 900,
              letterSpacing: "-.07em",
              lineHeight: 0.9,
              textTransform: "uppercase",
            }}
          >
            Developer
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 38,
            top: 40,
            width: 264,
            height: 428,
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
              borderBottom: "1px solid rgba(0,0,0,.16)",
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
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: ".18em",
                  color: "rgba(0,0,0,.42)",
                  textTransform: "uppercase",
                }}
              >
                Portfolio
              </span>
              <span
                style={{
                  marginTop: 8,
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: "-.05em",
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
                width: 62,
                height: 62,
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
              paddingTop: 24,
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
                    fontSize: 10,
                    fontWeight: 900,
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
                    letterSpacing: "-.01em",
                    lineHeight: 1.1,
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
              flexDirection: "column",
              marginTop: "auto",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {stackItems.map((item) => (
                <span
                  key={item}
                  style={{
                    display: "flex",
                    border: "1px solid rgba(0,0,0,.14)",
                    padding: "8px 10px",
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingTop: 10,
                borderTop: "1px solid rgba(0,0,0,.16)",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  background: "linear-gradient(135deg,#6768ff,#a53cdd,#ee4b67)",
                }}
              />
              {new URL(siteConfig.url).hostname}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
