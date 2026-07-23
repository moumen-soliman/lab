import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { components, getComponent } from "@/src/registry-data";
import { showcases } from "@/src/showcases";
import { highlight } from "@/src/lib/highlight";
import { CodeSection } from "@/src/components/CodeSection";
import { BackLink, Divider } from "@/src/components/navigation";

/* ─────────────────────────────────────────────────────────
 * ENTRANCE STORYBOARD (every component page shares this)
 *
 *    0ms   back link
 *   40ms   component title + intro (ShowcaseIntro delay=40)
 *   60ms   demo controls row
 *   70ms   the live demo surface
 *   90ms   status line under the demo
 *  100ms   Install / Usage / Source block
 *  120ms   divider
 *  140ms   footer byline
 * ───────────────────────────────────────────────────────── */

// Only the known slugs are valid pages; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return components.map((component) => ({ slug: component.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const component = getComponent(slug);
  if (!component) return {};

  const title = `${component.title} | moumenlab`;
  const description = component.description;
  const ogImage = `/og?component=${slug}&v=1`;

  return {
    title: component.title,
    description,
    alternates: { canonical: `/components/${slug}` },
    openGraph: {
      title,
      description,
      url: `/components/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// The exact file the registry serves is the file shown here; the usage box
// shows the example that lives beside it.
function readRegistryFile(slug: string, file: string): string | null {
  const abs = path.join(process.cwd(), "registry", "lab", slug, file);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
}

// The AI document build-registry.mjs generates (predev/prebuild, so it exists
// before any page render). Served at /r/<slug>.md; copied by "Copy .md".
function readGeneratedMd(slug: string): string | null {
  const abs = path.join(process.cwd(), "public", "r", `${slug}.md`);
  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);
  const Showcase = showcases[slug];
  if (!component || !Showcase) notFound();

  const source = readRegistryFile(slug, `${slug}.tsx`);
  if (!source) notFound();
  const usage = readRegistryFile(slug, "example.tsx");
  const markdown = readGeneratedMd(slug);
  const highlightedHtml = await highlight(source);
  const usageHtml = usage ? await highlight(usage) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-24 px-6 selection:bg-[#111] selection:text-white">
      <main className="w-full max-w-md">
        <header className="mb-8 animate-fade-in">
          <BackLink href="/components" label="Components" />
        </header>

        <Showcase />

        <CodeSection
          slug={slug}
          source={source}
          highlightedHtml={highlightedHtml}
          usage={usage}
          usageHtml={usageHtml}
          markdown={markdown}
        />

        <Divider delay={120} className="mt-10 mb-8" />

        <footer className="animate-fade-in text-center" style={{ animationDelay: "140ms" }}>
          <p className="text-gray-400 text-sm">
            By{" "}
            <Link href="https://moumen.dev" className="hover:text-[#111] transition-colors">
              Moumen Soliman
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
