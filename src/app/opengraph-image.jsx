import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = "Furkan Cosar frontend developer portfolio preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const stackItems = ["React", "Next.js", "GSAP", "Interface"];
const detailItems = ["Responsive UI", "Visual Motion", "Clean Frontend"];

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
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,.035) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 154,
            background: "#f4f4f1",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 82,
            right: 82,
            bottom: 154,
            height: 1,
            background: "rgba(255,255,255,.16)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 388,
            height: 476,
            background: "#f4f4f1",
            borderLeft: "1px solid rgba(255,255,255,.16)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 74,
            right: 82,
            display: "flex",
            flexDirection: "column",
            width: 282,
            color: "#050505",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(0,0,0,.18)",
              paddingBottom: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,.46)",
                }}
              >
                Portfolio
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "-.04em",
                  textTransform: "uppercase",
                }}
              >
                2026
              </span>
            </div>

            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                background: "#050505",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingTop: 28,
            }}
          >
            {detailItems.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 18,
                  borderBottom:
                    index === detailItems.length - 1
                      ? "0"
                      : "1px solid rgba(0,0,0,.12)",
                  paddingBottom: index === detailItems.length - 1 ? 0 : 16,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: ".11em",
                    textTransform: "uppercase",
                  }}
                >
                  {item}
                </span>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg,#6768ff,#a53cdd,#ee4b67)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 70,
            left: 82,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
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
            left: 82,
            top: 150,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 126,
              fontWeight: 900,
              letterSpacing: "-.075em",
              lineHeight: 0.82,
              textTransform: "uppercase",
            }}
          >
            Creative
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 126,
              fontWeight: 900,
              letterSpacing: "-.075em",
              lineHeight: 0.82,
              textTransform: "uppercase",
            }}
          >
            Frontend
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 14,
              padding: "10px 18px 12px",
              background: "linear-gradient(90deg,#6768ff,#a53cdd,#ee4b67)",
              color: "#050505",
              fontSize: 62,
              fontWeight: 900,
              letterSpacing: "-.045em",
              lineHeight: 0.88,
              textTransform: "uppercase",
            }}
          >
            Developer
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 82,
            bottom: 50,
            display: "flex",
            alignItems: "center",
            gap: 28,
            color: "#050505",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRight: "1px solid rgba(0,0,0,.16)",
              paddingRight: 28,
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#050505",
              }}
            />
            {new URL(siteConfig.url).hostname}
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {stackItems.map((item) => (
              <span
                key={item}
                style={{
                  display: "flex",
                  border: "1px solid rgba(0,0,0,.14)",
                  padding: "12px 14px",
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: ".1em",
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
