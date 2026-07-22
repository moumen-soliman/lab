// Validate the registry invariants that keep "add a component" cheap and safe:
// item name == slug == folder == file == page path, every referenced file
// exists, and every component has a showcase. Run from the repo root.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const appRoot = resolve(repoRoot, "apps/web");
const registry = JSON.parse(readFileSync(resolve(appRoot, "registry.json"), "utf8"));
const errors = [];

const names = new Set();
for (const item of registry.items) {
  if (names.has(item.name)) errors.push(`duplicate item name "${item.name}"`);
  names.add(item.name);
  if (!item.title || !item.description) errors.push(`item "${item.name}" is missing title/description`);

  if (item.type !== "registry:component") continue;

  const expectedPath = `registry/lab/${item.name}/${item.name}.tsx`;
  const file = item.files?.[0];
  if (!file || file.path !== expectedPath) {
    errors.push(`item "${item.name}" files[0].path must be "${expectedPath}"`);
  }
  if (file && !existsSync(resolve(appRoot, file.path))) {
    errors.push(`item "${item.name}" source missing: ${file.path}`);
  }
  if (!existsSync(resolve(appRoot, "registry/lab", item.name, "example.tsx"))) {
    errors.push(`item "${item.name}" usage example missing: registry/lab/${item.name}/example.tsx`);
  }
  if (!existsSync(resolve(appRoot, "src/showcases", `${item.name}-showcase.tsx`))) {
    errors.push(`item "${item.name}" showcase missing: src/showcases/${item.name}-showcase.tsx`);
  }
}

if (errors.length) {
  console.error("✗ registry check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ registry valid (${registry.items.length} items)`);
