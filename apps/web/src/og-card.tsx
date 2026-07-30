import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { pitchWords, site } from "./site";

/* ─────────────────────────────────────────────────────────
 * SOCIAL CARD
 *
 * One composition, the landing page's own: white field, mono
 * brand kicker, medium headline, quiet gray description.
 *
 * These render at BUILD time, through the opengraph-image
 * convention (app/opengraph-image.tsx and the one under
 * app/components/[slug]/). That is the whole point. The
 * previous version was an /og route rendering per request,
 * and in production every single card 500'd:
 *
 *   ENOENT /var/task/apps/web/node_modules/geist/dist/fonts/
 *          geist-sans/Geist-Regular.ttf
 *
 * Next traces which files a serverless function needs by
 * reading the source; it cannot see through a path assembled
 * at runtime, and pnpm's node_modules/geist is a symlink out
 * to a .pnpm store the trace never followed. So the fonts
 * were simply not in the bundle. Baking the images at build
 * time removes the question: node_modules is on disk when the
 * build runs, and what ships is a PNG on the CDN, which has
 * no filesystem and no way to fail.
 * ───────────────────────────────────────────────────────── */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Read straight off disk relative to the build's working directory, which for
// `next build` is this app. Deliberately NOT require.resolve: webpack rewrites
// that to an internal module id, and geist's exports map does not expose
// package.json anyway. This path is only ever walked while the build runs, on a
// machine that has node_modules, so cwd is the honest way to say it.
const FONT_DIR = join(process.cwd(), "node_modules", "geist", "dist", "fonts");

export async function loadFonts() {
  const [regular, medium, mono] = await Promise.all([
    readFile(join(FONT_DIR, "geist-sans", "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "geist-sans", "Geist-Medium.ttf")),
    readFile(join(FONT_DIR, "geist-mono", "GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

function Card({ title, description }: { title: string; description: ReactNode }) {
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
          {site.name}
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
function TextDescription({ text }: { text: string }) {
  return <div style={DESCRIPTION}>{text}</div>;
}

// Long descriptions cut on a word, never mid-syllable.
function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Any card that is a title over a sentence: a component, or the lab index. */
export function TextCard(title: string, description: string) {
  return <Card title={title} description={<TextDescription text={truncate(description)} />} />;
}

export function NotFoundCard(slug: string) {
  return <Card title="Component not found" description={<TextDescription text={slug} />} />;
}

// The landing sets its key phrases in font-medium ink against gray; the card
// does the same, from the same segment list.
//
// One span per WORD inside a wrapping flex row: satori has no inline layout, so
// a whole phrase in one span would be an unbreakable flex item and the
// paragraph would set ragged. Words are the items, the column gap is the word
// space, and the row gap is 0 because each span already carries the line box.
export function SiteCard() {
  return (
    <Card
      title={site.tagline}
      description={
        <div
          style={{
            ...DESCRIPTION,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            // Numeric, never the `gap: "0 7px"` shorthand: satori drops the
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
        </div>
      }
    />
  );
}
