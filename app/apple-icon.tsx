import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";
import { initialsOf } from "@/lib/utils";

// Home-screen and bookmark icon for Apple devices. Square: iOS rounds the corners itself.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: -5,
        }}
      >
        {initialsOf(portfolio.name)}
      </div>
    ),
    size,
  );
}
