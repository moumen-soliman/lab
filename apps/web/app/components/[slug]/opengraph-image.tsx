import { ImageResponse } from "next/og";
import { NotFoundCard, OG_CONTENT_TYPE, OG_SIZE, TextCard, loadFonts } from "@/src/og-card";
import { components, getComponent } from "@/src/registry-data";

// One PNG per component, pre-rendered alongside its page. The slug list is the
// page's own, so a component can never ship with a page but no card.
export function generateStaticParams() {
  return components.map((component) => ({ slug: component.slug }));
}

// `alt` has to be one static string for the whole route; the card itself
// carries the component's name.
export const alt = "A moumenlab component";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  const fonts = await loadFonts();

  return new ImageResponse(component ? TextCard(component.title, component.description) : NotFoundCard(slug), {
    ...size,
    fonts,
  });
}
