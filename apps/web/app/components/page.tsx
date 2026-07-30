import type { Metadata } from "next";
import { LabHome } from "@/src/components/LabHome";
import { bento } from "@/src/registry-data";
import { site } from "@/src/site";

// The page's own heading and intro, from src/site.ts, so the <title>, the card
// and the <h1> cannot drift apart. The twitter block is spelled out because a
// segment that declares openGraph/twitter replaces the parent's entirely;
// without it this page kept advertising the landing page's title.
const { title, description } = site.lab;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/components" },
  openGraph: {
    title: `${title} | ${site.name}`,
    description,
    url: "/components",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${site.name}`,
    description,
  },
};

export default function ComponentsPage() {
  return <LabHome bento={bento} />;
}
