# moumenlab

Install [moumenlab](https://lab.moumen.dev) components into your React + Tailwind
app.

```bash
npx moumenlab add hover-expand-icon-strip
npx moumenlab add otp-segmented-input drag-to-reorder-list
npx moumenlab list
```

`add` validates the component names against the live registry, then delegates to
`shadcn add` so you get dependency install, theme-token merging, path-alias
resolution and overwrite prompts for free. You can always call shadcn directly:

```bash
npx shadcn@latest add https://lab.moumen.dev/r/hover-expand-icon-strip.json
```

## Requirements

- Node 18+
- A React 19 + Tailwind CSS v4 project (the shadcn CLI handles the rest)

## Environment

- `MOUMENLAB_REGISTRY` — override the registry origin (defaults to
  `https://lab.moumen.dev`). Useful for testing against a local build.

## License

[MIT](../../LICENSE) © Moumen Soliman
