import { createRequire } from "node:module";
import { add } from "./add";
import { list } from "./list";
import { registryOrigin } from "./registry";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

function help(): void {
  console.log(`
moumenlab — interaction components you can copy or install.

Usage
  npx moumenlab add <component...>   Install one or more components
  npx moumenlab list                 List every available component
  npx moumenlab --help               Show this help
  npx moumenlab --version            Show the version

Examples
  npx moumenlab add otp-segmented-input
  npx moumenlab add hover-expand-icon-strip drag-to-reorder-list

Browse them all at https://lab.moumen.dev
`);
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const origin = registryOrigin();

  switch (command) {
    case "add":
      return add(rest, origin);
    case "list":
    case "ls":
      return list(origin);
    case "-v":
    case "--version":
      console.log(pkg.version);
      return;
    case undefined:
    case "-h":
    case "--help":
    case "help":
      return help();
    default:
      console.error(`Unknown command: ${command}\n`);
      help();
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
