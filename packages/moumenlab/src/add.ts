import { spawn } from "node:child_process";
import { components, fetchIndex } from "./registry";

// Flags shadcn `add` accepts that take a value.
const FLAGS_WITH_VALUE = new Set(["-c", "--cwd", "-p", "--path"]);

// Boolean / optional-value flags we forward through unchanged.
const FLAGS_PASSTHROUGH = new Set([
  "-y",
  "--yes",
  "-o",
  "--overwrite",
  "-s",
  "--silent",
  "--dry-run",
]);

function parseAddArgs(args: string[]): { names: string[]; flags: string[] } {
  const names: string[] = [];
  const flags: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (FLAGS_WITH_VALUE.has(arg)) {
      flags.push(arg);
      const value = args[i + 1];
      if (value && !value.startsWith("-")) {
        flags.push(value);
        i += 1;
      }
      continue;
    }

    if (arg.startsWith("--cwd=") || arg.startsWith("--path=")) {
      flags.push(arg);
      continue;
    }

    if (FLAGS_PASSTHROUGH.has(arg) || arg === "--diff" || arg === "--view") {
      flags.push(arg);
      // `--diff [path]` / `--view [path]` may take an optional path.
      const next = args[i + 1];
      if ((arg === "--diff" || arg === "--view") && next && !next.startsWith("-")) {
        flags.push(next);
        i += 1;
      }
      continue;
    }

    if (arg.startsWith("-")) {
      // Unknown flag — still forward so shadcn can error with its own help.
      flags.push(arg);
      continue;
    }

    names.push(arg);
  }

  return { names, flags };
}

// `moumenlab add <name...>` validates the names against the live registry, then
// delegates to `shadcn add <url>` — which handles dependency install, cssVars
// merging, path aliases and overwrite prompts. Thin on purpose.
export async function add(args: string[], origin: string): Promise<void> {
  const { names, flags } = parseAddArgs(args);

  if (names.length === 0) {
    console.error("Usage: moumenlab add <component...> [options]");
    console.error("Options are forwarded to shadcn (e.g. -c apps/web, -y, -o).");
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
  const child = spawn("npx", ["shadcn@latest", "add", ...flags, ...urls], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
  child.on("error", (error) => {
    console.error(`Failed to run shadcn: ${error.message}`);
    process.exit(1);
  });
}
