import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Dev writes to .next-dev (set by the dev script) so a concurrent
  // `next build` can never clobber the running dev server's incremental
  // state — that collision silently kills Fast Refresh until a dev restart.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Trace from the monorepo root (silences the multi-lockfile heuristic).
  outputFileTracingRoot: path.join(appDir, "..", ".."),
  async headers() {
    return [
      {
        // Immutable clips.
        source: "/lab/:path*.mov",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Registry payloads — CDN-cached, revalidated, CORS-open for the CLI.
        source: "/r/:path*.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
