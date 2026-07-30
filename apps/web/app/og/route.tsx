import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { getComponent } from "@/src/registry-data";
import { pitchWords, site } from "@/src/site";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

// White field, mono brand kicker, medium headline, quiet gray description: the
// landing's own composition. Bare /og renders the site card from the same
// strings the <meta> tags use, so the two can't say different things; the
// checked-in og-lab.png is a snapshot of this route (see src/site.ts).
function ComponentOGImage(title: string, description: ReactNode) {
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

        {description}
      </div>
    </div>
  );
}

// Shared by both description shapes; each supplies its own display.
const DESCRIPTION = {
  fontSize: 28,
  fontWeight: 400,
  color: "#6b7280",
  lineHeight: 1.45,
  maxWidth: 780,
} as const;

/** A component's own sentence: one text node, satori flows and wraps it. */
function TextDescription(text: string) {
  return <div style={DESCRIPTION}>{text}</div>;
}

function NotFoundOGImage(slug: string) {
  return ComponentOGImage("Component not found", TextDescription(slug));
}

// The landing sets its key phrases in font-medium ink against gray; the card
// does the same, from the same segment list.
//
// One span per word inside a wrapping flex row: satori has no inline layout, so
// a whole phrase in one span would be an unbreakable flex item and the
// paragraph would set ragged. Words are the items, the column gap is the word
// space, and the row gap is 0 because each span already carries the line box.
function SiteOGImage() {
  return ComponentOGImage(
    site.tagline,
    <div
      style={{
        ...DESCRIPTION,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        // Numeric, never the `gap: "0 9px"` shorthand: satori drops the
        // shorthand silently and every word runs into the next.
        columnGap: 7,
        rowGap: 0,
      }}
    >
      {pitchWords().map((entry, index) => (
        <span key={index} style={entry.strong ? { fontWeight: 500, color: "#111111" } : undefined}>
          {entry.word}
        </span>
      ))}
    </div>,
  );
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
    const component = slug ? getComponent(slug) : null;
    const fonts = await loadFonts();

    const jsx = !slug
      ? SiteOGImage()
      : component
        ? ComponentOGImage(component.title, TextDescription(truncate(component.description)))
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
