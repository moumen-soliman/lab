import type { Metadata } from "next";
import { LabHome } from "@/src/components/LabHome";
import { bento } from "@/src/registry-data";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Interaction experiments, each a short looping clip. Open any for the live component, its blueprint, and the installable source.",
  alternates: { canonical: "/components" },
};

export default function ComponentsPage() {
  return <LabHome bento={bento} />;
}
