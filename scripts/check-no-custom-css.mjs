// Enforce the hard rule: zero custom CSS classes anywhere.
//
//   1. Exactly one .css file exists (apps/web/src/styles.css).
//   2. That file contains no class selectors and no @utility/@apply — only
//      @import / @source / @theme / @layer base with element selectors.
//   3. No .tsx/.ts references a leftover bespoke class name.
//
// Everything visual is a Tailwind utility in JSX. Run from the repo root.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const IGNORE = new Set(["node_modules", "dist", ".turbo", ".git", ".next", ".next-dev", "out", "r"]);
const errors = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(repoRoot);
const rel = (p) => relative(repoRoot, p);

// 1 + 2 — the single stylesheet.
const cssFiles = files.filter((f) => extname(f) === ".css");
const allowed = resolve(repoRoot, "apps/web/app/globals.css");
for (const css of cssFiles) {
  if (css !== allowed) errors.push(`Unexpected CSS file: ${rel(css)} (only apps/web/app/globals.css is allowed)`);
}
if (cssFiles.includes(allowed)) {
  const lines = readFileSync(allowed, "utf8").split("\n");
  let inComment = false;
  lines.forEach((line, i) => {
    let text = line;
    if (inComment) {
      if (text.includes("*/")) {
        text = text.slice(text.indexOf("*/") + 2);
        inComment = false;
      } else return;
    }
    text = text.replace(/\/\*.*?\*\//g, "");
    if (text.includes("/*")) {
      inComment = true;
      text = text.slice(0, text.indexOf("/*"));
    }
    const trimmed = text.trim();
    if (/^\.[a-zA-Z]/.test(trimmed)) errors.push(`globals.css:${i + 1} class selector "${trimmed}"`);
    if (/@utility\b/.test(trimmed)) errors.push(`globals.css:${i + 1} @utility is not allowed`);
    if (/@apply\b/.test(trimmed)) errors.push(`globals.css:${i + 1} @apply is not allowed`);
  });
}

// 3 — leftover bespoke class names in JS/TS sources.
const BANNED = [
  "t-strip", "t-spec", "t-nm", "t-cmdk", "t-checkout", "t-share", "t-booking",
  "t-otp", "t-mention", "t-navsearch", "t-sched", "t-upload", "t-ticket",
  "t-wheel", "t-reorder", "t-guides", "t-xexpand", "t-color",
  "lab-clip", "lab-view", "lab-more", "lab-intro",
  "crafted-clip", "crafted-blur", "crafted-placeholder", "spec-grid", "border-overlay",
];
// Strip comments (a comment may legitimately reference the CSS class a
// component was converted from) but keep `://` in URLs intact.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/(^|[^:])\/\/.*$/, "$1"))
    .join("\n");
}

for (const file of files) {
  if (![".ts", ".tsx"].includes(extname(file))) continue;
  const lines = stripComments(readFileSync(file, "utf8")).split("\n");
  lines.forEach((line, i) => {
    for (const token of BANNED) {
      // Class-boundary guard: "t-color" must not match inside "caret-color".
      const re = new RegExp(`(?<![a-zA-Z0-9-])${token}`);
      if (re.test(line)) errors.push(`${rel(file)}:${i + 1} banned class token "${token}"`);
    }
  });
}

if (errors.length) {
  console.error("✗ custom-CSS check failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log("✓ no custom CSS classes");
