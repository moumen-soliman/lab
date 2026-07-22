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

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
mkdirSync(outDir, { recursive: true });

for (const item of registry.items) {
  const files = (item.files ?? []).map((file) => {
    const abs = resolve(appRoot, file.path);
    if (!existsSync(abs)) throw new Error(`Registry file missing: ${file.path}`);
    return { ...file, content: readFileSync(abs, "utf8") };
  });
  const payload = { $schema: ITEM_SCHEMA, ...item, files };
  writeFileSync(resolve(outDir, `${item.name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
}

// The index the CLI's `list` command and discovery read.
writeFileSync(resolve(outDir, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

console.log(`registry: wrote ${registry.items.length} item(s) → public/r/`);
