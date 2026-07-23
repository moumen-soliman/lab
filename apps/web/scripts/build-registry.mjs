// Build the shadcn-format registry payloads that lab.moumen.dev/r/*.json serves.
//
// Reads registry.json (the source of truth), inlines each item's file contents,
// and writes one JSON per item plus an index. This is what `npx shadcn add <url>`
// and `npx moumenlab add <name>` consume. Deterministic, no external CLI — the
// output is schema-conformant registry-item JSON.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const registryPath = resolve(appRoot, "registry.json");
const outDir = resolve(appRoot, "public/r");
const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

const SITE = "https://lab.moumen.dev";

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
mkdirSync(outDir, { recursive: true });

// One markdown per item — the whole component as a single AI-ready document:
// description, install commands, the usage example and the full source. This is
// what /r/<name>.md serves, what llms.txt points at, and what the "Copy .md"
// action on each component page copies.
function itemMarkdown(item, files) {
  const isComponent = item.type === "registry:component";
  const lines = [`# ${item.title}`, "", item.description, ""];
  if (isComponent) lines.push(`- Demo: ${SITE}/components/${item.name}`);
  lines.push(
    `- Install: \`npx moumenlab add ${item.name}\` — or \`npx shadcn@latest add ${SITE}/r/${item.name}.json\``,
  );
  if (item.dependencies?.length) lines.push(`- Dependencies: ${item.dependencies.join(", ")}`);
  if (item.registryDependencies?.length) lines.push(`- Registry dependencies: ${item.registryDependencies.join(", ")}`);
  for (const file of files) lines.push(`- Installs to: \`${file.target ?? file.path}\``);

  const examplePath = resolve(appRoot, "registry/lab", item.name, "example.tsx");
  if (isComponent && existsSync(examplePath)) {
    lines.push("", "## Usage", "", "```tsx", readFileSync(examplePath, "utf8").trim(), "```");
  }
  for (const file of files) {
    lines.push("", `## Source — \`${file.target ?? file.path}\``, "", "```tsx", file.content.trim(), "```");
  }
  return `${lines.join("\n")}\n`;
}

for (const item of registry.items) {
  const files = (item.files ?? []).map((file) => {
    const abs = resolve(appRoot, file.path);
    if (!existsSync(abs)) throw new Error(`Registry file missing: ${file.path}`);
    return { ...file, content: readFileSync(abs, "utf8") };
  });
  const payload = { $schema: ITEM_SCHEMA, ...item, files };
  writeFileSync(resolve(outDir, `${item.name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(resolve(outDir, `${item.name}.md`), itemMarkdown(item, files));
}

// The index the CLI's `list` command and discovery read.
writeFileSync(resolve(outDir, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

// /llms.txt — the AI-discovery index (llmstxt.org): what this site is, and one
// line per component pointing at its self-contained markdown doc.
const componentItems = registry.items.filter((item) => item.type === "registry:component");
const llms = [
  `# ${registry.name ?? "moumenlab"}`,
  "",
  "> A lab of polished React interface components — Tailwind CSS + motion/react, installable with the shadcn CLI. Every component ships as one self-contained file.",
  "",
  "Each component has a single-file markdown doc — description, install command, usage example and full source — at /r/<name>.md. Fetch that one file for complete context on a component.",
  "",
  "## Components",
  "",
  ...componentItems.map((item) => `- [${item.title}](${SITE}/r/${item.name}.md): ${item.description}`),
  "",
  "## Registry",
  "",
  `- [registry.json](${SITE}/r/registry.json): shadcn-format registry index (per-item payloads at /r/<name>.json)`,
];
writeFileSync(resolve(appRoot, "public/llms.txt"), `${llms.join("\n")}\n`);

console.log(`registry: wrote ${registry.items.length} item(s) (.json + .md) + llms.txt → public/`);
