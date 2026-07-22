import type { Metadata } from "next";
import { LabHome } from "@/src/components/LabHome";
import { bento } from "@/src/registry-data";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Interaction experiments as short looping clips. Open any for the live demo, blueprint, and source you can copy or install with npx moumenlab add.",
  alternates: { canonical: "/components" },
  openGraph: {
    title: "Components | moumenlab",
    description:
      "Interaction experiments as short looping clips. Open any for the live demo, blueprint, and installable source.",
    url: "/components",
  },
};

export default function ComponentsPage() {
  return <LabHome bento={bento} />;
}
