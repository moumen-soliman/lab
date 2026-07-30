import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, TextCard, loadFonts } from "@/src/og-card";
import { site } from "@/src/site";

// This page needs its own card rather than inheriting the root's. A segment
// that declares `openGraph` in its metadata shallow-replaces the parent's whole
// openGraph object, and the inherited image goes with it: /components had been
// shipping with no og:image at all.
export const alt = `${site.lab.title} - ${site.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(TextCard(site.lab.title, site.lab.card), {
    ...size,
    fonts: await loadFonts(),
  });
}
