import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const initials = portfolio.name
  .split(/\s+/)
  .map((word) => word[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

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
          background: "#0b0b0c",
          color: "#ff6a3d",
          borderRadius: 16,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        {initials}
      </div>
    ),
    size,
  );
}
