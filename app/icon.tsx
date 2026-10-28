import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";
import { initialsOf } from "@/lib/utils";

export const size = { width: 64, height: 64 };
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
          borderRadius: 32,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        {initialsOf(portfolio.name)}
      </div>
    ),
    size,
  );
}
