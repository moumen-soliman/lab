import type { Metadata } from "next";
import { LabHome } from "@/src/components/LabHome";
import { bento } from "@/src/registry-data";

// The page's own heading and intro, verbatim. It called itself "Component Lab"
// on screen and "Components" in the tab strip; a title that doesn't match the
// h1 costs the reader the one confirmation they wanted, that they landed right.
const title = "Component Lab";
const description =
  "Interaction experiments, each a short looping clip. Open any for the live component, its blueprint, and the source you can copy or install with npx moumenlab add.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/components" },
  openGraph: {
    title: `${title} | moumenlab`,
    description,
    url: "/components",
  },
};

export default function ComponentsPage() {
  return <LabHome bento={bento} />;
}
