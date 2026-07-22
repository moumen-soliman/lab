import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getComponent } from "@/src/registry-data";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };
const SITE = "https://lab.moumen.dev";
const DEFAULT_OG = `${SITE}/og-lab.png`;

// Matches the static og-lab.png: white field, mono brand kicker, medium
// headline, quiet gray description — same composition as the landing.
function ComponentOGImage(title: string, description: string) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        padding: "80px 96px",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 920,
        }}
      >
        <div
          style={{
            fontFamily: "Geist Mono",
            fontSize: 22,
            letterSpacing: "0.04em",
            color: "#6b7280",
            marginBottom: 28,
          }}
        >
          moumenlab
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 500,
            color: "#111111",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 28,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "#6b7280",
            lineHeight: 1.45,
            maxWidth: 780,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

function NotFoundOGImage(slug: string) {
  return ComponentOGImage("Component not found", slug);
}

async function loadFonts() {
  const root = join(process.cwd(), "node_modules", "geist", "dist", "fonts");
  const [regular, medium, mono] = await Promise.all([
    readFile(join(root, "geist-sans", "Geist-Regular.ttf")),
    readFile(join(root, "geist-sans", "Geist-Medium.ttf")),
    readFile(join(root, "geist-mono", "GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("component");

    if (!slug) {
      return Response.redirect(DEFAULT_OG, 302);
    }

    const component = getComponent(slug);
    const fonts = await loadFonts();

    const jsx = component
      ? ComponentOGImage(component.title, truncate(component.description))
      : NotFoundOGImage(slug);

    const imageResponse = new ImageResponse(jsx, {
      ...SIZE,
      fonts,
    });

    imageResponse.headers.set(
      "Cache-Control",
      "public, s-maxage=31536000, max-age=31536000, stale-while-revalidate=604800",
    );

    return imageResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: `Failed to generate the image: ${message}` }, { status: 500 });
  }
}
