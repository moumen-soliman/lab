import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, SiteCard, loadFonts } from "@/src/og-card";
import { site } from "@/src/site";

// The site card, baked once at build time and inherited by every route that
// does not ship its own (the landing, /components, any future page).
export const alt = `${site.name} - ${site.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(SiteCard(), { ...size, fonts: await loadFonts() });
}
