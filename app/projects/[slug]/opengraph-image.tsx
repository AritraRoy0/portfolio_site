import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";
import { projectBySlug, projectTitle } from "@/lib/seo";
import { hostOf, pad2 } from "@/lib/utils";

// The preview card when a project page is shared: the project's name, and its screenshot in a browser window.

const size = { width: 1200, height: 630 };

const GLOW = "radial-gradient(circle at 88% 18%, rgba(200,255,61,0.24) 0%, rgba(200,255,61,0.06) 30%, rgba(200,255,61,0) 55%)";
const GRID = "linear-gradient(to right, rgba(241,241,236,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(241,241,236,0.07) 1px, transparent 1px)";

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const project = projectBySlug(params.slug);
  return [
    {
      id: "card",
      size,
      contentType: "image/png",
      alt: project ? `${projectTitle(project)}, a project by ${portfolio.name}` : portfolio.name,
    },
  ];
}

async function screenshotOf(image: string) {
  const type = extname(image).slice(1).replace("jpg", "jpeg");
  const data = await readFile(join(process.cwd(), "public", image), "base64");
  return `data:image/${type};base64,${data}`;
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const project = projectBySlug((await params).slug);
  if (!project) return new Response("Not found", { status: 404 });

  const index = portfolio.projects.indexOf(project);
  const screenshot = project.image ? await screenshotOf(project.image) : null;
  // Long names step down so they stay clear of the screenshot.
  const titleSize = Math.min(120, Math.floor(900 / project.title.length));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#08080a",
          backgroundImage: `${GLOW}, ${GRID}`,
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
          color: "#f1f1ec",
        }}
      >
        {screenshot && (
          <div
            style={{
              position: "absolute",
              left: 640,
              top: 132,
              width: 760,
              display: "flex",
              flexDirection: "column",
              borderRadius: 22,
              overflow: "hidden",
              border: "1px solid rgba(241,241,236,0.18)",
              background: "#0f0f12",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9, height: 44, padding: "0 18px", borderBottom: "1px solid rgba(241,241,236,0.09)" }}>
              <span style={{ display: "flex", width: 12, height: 12, borderRadius: 6, background: "#ff5f57" }} />
              <span style={{ display: "flex", width: 12, height: 12, borderRadius: 6, background: "#febc2e" }} />
              <span style={{ display: "flex", width: 12, height: 12, borderRadius: 6, background: "#28c840" }} />
              <span style={{ display: "flex", marginLeft: 28, padding: "4px 14px", borderRadius: 8, background: "#17171b", color: "#8b8b94", fontSize: 16 }}>
                {hostOf(project.demo || project.code)}
              </span>
            </div>
            <img src={screenshot} width={760} height={428} style={{ objectFit: "cover", objectPosition: "top" }} alt="" />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, padding: "60px 0 60px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 4, color: "#8b8b94" }}>
            <span style={{ color: "#c8ff3d" }}>{pad2(index + 1)}</span>
            <span>/ {pad2(portfolio.projects.length)}</span>
            <span style={{ display: "flex", width: 36, height: 1, background: "rgba(241,241,236,0.3)" }} />
            <span>PROJECT</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: titleSize, fontWeight: 700, letterSpacing: -titleSize * 0.05, lineHeight: 0.95 }}>
              {project.title}
            </span>
            {project.subtitle && (
              <span style={{ marginTop: 22, fontSize: 34, lineHeight: 1.2, color: "#c8ff3d" }}>{project.subtitle}</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 22, color: "#8b8b94" }}>
            <span style={{ color: "#f1f1ec", fontWeight: 600 }}>{portfolio.name}</span>
            <span>{portfolio.role}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
