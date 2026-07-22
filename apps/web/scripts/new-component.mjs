// Scaffold a new component end to end. This is the "component #17 is cheap"
// guarantee: it writes the installable stub, the showcase stub, and wires
// registry.json + showcases.tsx — no route, config, or CLI edits (the dynamic
// /components/[slug] route and registry-data pick it up automatically).
//
//   pnpm new:component "Radial Dial" radial-dial
//
// Then: write the component (Tailwind-only, see CONTRIBUTING.md), fill in the
// showcase copy, and optionally drop a clip in public/lab + `pnpm blurs` and add
// it to the `videos` map in src/registry-data.ts.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const [title, slug] = process.argv.slice(2);

if (!title || !slug) {
  console.error('Usage: pnpm new:component "<Title>" <slug-kebab-case>');
  process.exit(1);
}
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`Invalid slug "${slug}" — use kebab-case (e.g. radial-dial).`);
  process.exit(1);
}

const pascal = slug
  .split("-")
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join("");
const description = `TODO: one-line description of ${title}.`;

// 1. Installable component stub -------------------------------------------------
const componentDir = resolve(appRoot, "registry/lab", slug);
const componentPath = resolve(componentDir, `${slug}.tsx`);
if (existsSync(componentPath)) {
  console.error(`Component already exists: ${componentPath}`);
  process.exit(1);
}
mkdirSync(componentDir, { recursive: true });
writeFileSync(
  componentPath,
  `"use client";

// ${title} — TODO: one-paragraph description of the hard-constraint story.
//
// Requires the lab-theme registry item (shared tokens). Fully Tailwind, no CSS
// files, zero runtime dependencies. See CONTRIBUTING.md for the porting recipe.

export default function ${pascal}() {
  return <div className="text-sm text-gray-500">${title}: TODO</div>;
}
`,
);

// 2. Usage example stub ---------------------------------------------------------
writeFileSync(
  resolve(componentDir, "example.tsx"),
  `"use client";

import ${pascal} from "./${slug}";

export default function ${pascal}Example() {
  return <${pascal} />;
}
`,
);

// 3. Showcase stub --------------------------------------------------------------
writeFileSync(
  resolve(appRoot, "src/showcases", `${slug}-showcase.tsx`),
  `"use client";

import { ShowcaseIntro } from "./shared";
import ${pascal}Example from "@/registry/lab/${slug}/example";

export function ${pascal}Showcase() {
  return (
    <>
      <ShowcaseIntro title="${title}" delay={40} defaultOpen>
        ${description}
      </ShowcaseIntro>
      <section
        className="animate-fade-in relative flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50/60 px-6 py-12 min-h-[160px]"
        style={{ animationDelay: "70ms" }}
      >
        <${pascal}Example />
      </section>
    </>
  );
}
`,
);

// 4. registry.json --------------------------------------------------------------
const registryPath = resolve(appRoot, "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
if (registry.items.some((item) => item.name === slug)) {
  console.error(`registry.json already has an item named "${slug}"`);
  process.exit(1);
}
registry.items.push({
  name: slug,
  type: "registry:component",
  title,
  description,
  registryDependencies: ["https://lab.moumen.dev/r/lab-theme.json"],
  files: [
    {
      path: `registry/lab/${slug}/${slug}.tsx`,
      type: "registry:component",
      target: `components/lab/${slug}.tsx`,
    },
  ],
});
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

// 5. showcases.tsx (marker insertion) ------------------------------------------
const mapPath = resolve(appRoot, "src/showcases.tsx");
let map = readFileSync(mapPath, "utf8");
map = map.replace(
  "// @scaffold:import",
  `import { ${pascal}Showcase } from "./showcases/${slug}-showcase";\n// @scaffold:import`,
);
map = map.replace("  // @scaffold:entry", `  "${slug}": ${pascal}Showcase,\n  // @scaffold:entry`);
writeFileSync(mapPath, map);

console.log(`\nScaffolded "${title}" (${slug}):`);
console.log(`  • registry/lab/${slug}/${slug}.tsx   ← write the component here (no demo data)`);
console.log(`  • registry/lab/${slug}/example.tsx   ← the usage shown on the page`);
console.log(`  • src/showcases/${slug}-showcase.tsx  ← write the demo + copy`);
console.log(`  • registry.json + showcases.tsx wired`);
console.log(`\nUpdate the description in registry.json, then build the component.`);
