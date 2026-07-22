# moumenlab

Interaction experiments you can watch, read, and drop into your app. A component
lab by [Moumen Soliman](https://moumen.dev) — each component is a self-contained
React + Tailwind file with a hard-constraint story behind it.

Browse them at **[lab.moumen.dev](https://lab.moumen.dev)**.

## Install a component

```bash
npx moumenlab add hover-expand-icon-strip
```

`moumenlab` is a thin wrapper over the [shadcn](https://ui.shadcn.com) registry
format, so you can also use the shadcn CLI directly:

```bash
npx shadcn@latest add https://lab.moumen.dev/r/hover-expand-icon-strip.json
```

Either way the component and its shared theme tokens are copied into your project
— you own the code, there's no runtime package to depend on.

### Requirements

- React 19
- Tailwind CSS v4
- [motion](https://motion.dev) (installed automatically by the CLI)

Components are **fully Tailwind** — there are no CSS files to import — and
animate with motion/react. Shared design tokens (easings, the `shadow-border`
ring) ride along in the `lab-theme` registry item and merge into your Tailwind
`@theme` on install.

## Repo layout

This is a pnpm + Turborepo monorepo:

```
apps/web              The showcase site (Next.js App Router + React 19 + Tailwind v4)
  app/                Routes: / (landing), /components (grid), /components/[slug] (detail, SSG)
  registry/lab/*      The installable component sources (one folder each)
  registry.json       Registry source of truth (metadata + files)
  src/showcases/*      Per-component live demos
packages/moumenlab    The `npx moumenlab` CLI
```

Component pages live at `lab.moumen.dev/components/<slug>`, statically generated
from `registry.json`. The registry payloads at `/r/*.json` are generated from
`registry.json` on every build, and the exact file the registry serves is the
file shown on each page (highlighted server-side) and installed by the CLI.

## Develop

```bash
pnpm install
pnpm dev          # showcase site on http://localhost:3000
pnpm build        # build everything
pnpm check        # zero-custom-CSS + registry invariants
```

## Add a component

```bash
cd apps/web
pnpm new:component "Radial Dial" radial-dial
```

That scaffolds the installable stub, the showcase, wires `registry.json` +
`entries.tsx`, and generates the page. Then write the component (Tailwind only —
see [CONTRIBUTING.md](./CONTRIBUTING.md)) and optionally drop a clip in
`public/lab`. No config, router, or CLI changes needed.

## License

[MIT](./LICENSE) © Moumen Soliman
