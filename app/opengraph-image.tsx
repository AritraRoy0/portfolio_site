import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";

// The preview card shown when the site is shared on LinkedIn, Slack, iMessage, etc.

export const alt = `${portfolio.name}, ${portfolio.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#0b0b0c",
          color: "#ededea",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: "#8d8d92" }}>
          <span>PORTFOLIO</span>
          <span>{portfolio.location.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 168, fontWeight: 700, letterSpacing: -8, lineHeight: 0.9 }}>
          <span>{first}</span>
          <span style={{ paddingLeft: 90 }}>
            {rest.join(" ")}
            <span style={{ color: "#ff6a3d" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 32 }}>
          <span>{portfolio.role}</span>
          <div style={{ display: "flex", width: 22, height: 22, borderRadius: 11, background: "#ff6a3d" }} />
        </div>
      </div>
    ),
    size,
  );
}
