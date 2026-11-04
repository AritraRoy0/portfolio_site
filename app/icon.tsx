import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";
import { initialsOf } from "@/lib/utils";

// 192px stays sharp wherever it is scaled to: browser tabs, Google results, Android launchers.
// It is also served at /favicon.ico (see next.config.ts).
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c8ff3d",
          color: "#0b0b0c",
          borderRadius: 96,
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: -6,
        }}
      >
        {initialsOf(portfolio.name)}
      </div>
    ),
    size,
  );
}
