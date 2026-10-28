import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";

// The preview card shown when the site is shared on LinkedIn, Slack, iMessage, etc.

export const alt = `${portfolio.name}, ${portfolio.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GLOW = "radial-gradient(circle at 88% 18%, rgba(200,255,61,0.24) 0%, rgba(200,255,61,0.06) 30%, rgba(200,255,61,0) 55%)";
const GRID = "linear-gradient(to right, rgba(241,241,236,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(241,241,236,0.07) 1px, transparent 1px)";

export default function OpengraphImage() {
  const [first, ...rest] = portfolio.name.split(" ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080a",
          backgroundImage: `${GLOW}, ${GRID}`,
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
          color: "#f1f1ec",
          padding: "60px 72px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: "#8b8b94" }}>
          <span>PORTFOLIO</span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "flex", width: 12, height: 12, borderRadius: 6, background: "#34d399" }} />
            {(portfolio.availability || String(new Date().getFullYear())).toUpperCase()}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 168, fontWeight: 700, letterSpacing: -8, lineHeight: 0.88 }}>
          <span>{first}</span>
          <span style={{ display: "flex", alignItems: "flex-end" }}>
            {rest.join(" ")}
            <span style={{ display: "flex", width: 16, height: 120, marginLeft: 14, marginBottom: 14, background: "#c8ff3d" }} />
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 32 }}>
          <span>{portfolio.role}</span>
          <span
            style={{
              display: "flex",
              padding: "14px 28px",
              borderRadius: 40,
              background: "#c8ff3d",
              color: "#0b0b0c",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            Let’s talk
          </span>
        </div>
      </div>
    ),
    size,
  );
}
