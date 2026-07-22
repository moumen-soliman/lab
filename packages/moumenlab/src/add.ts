import { spawn } from "node:child_process";
import { components, fetchIndex } from "./registry";

// `moumenlab add <name...>` validates the names against the live registry, then
// delegates to `shadcn add <url>` — which handles dependency install, cssVars
// merging, path aliases and overwrite prompts. Thin on purpose.
export async function add(names: string[], origin: string): Promise<void> {
  if (names.length === 0) {
    console.error("Usage: moumenlab add <component...>");
    console.error('Run "moumenlab list" to see everything available.');
    process.exit(1);
  }

  const index = await fetchIndex(origin);
  const known = new Set(components(index).map((item) => item.name));
  const unknown = names.filter((name) => !known.has(name));
  if (unknown.length > 0) {
    console.error(`Unknown component${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}`);
    console.error('Run "moumenlab list" to see the available components.');
    process.exit(1);
  }

  const urls = names.map((name) => `${origin}/r/${name}.json`);
  const child = spawn("npx", ["shadcn@latest", "add", ...urls], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
  child.on("error", (error) => {
    console.error(`Failed to run shadcn: ${error.message}`);
    process.exit(1);
  });
}
