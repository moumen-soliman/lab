import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { OpenPanelComponent } from '@openpanel/nextjs';
import { RegistryPalette } from "@/src/components/RegistryPalette";
import { components } from "@/src/registry-data";
import { site } from "@/src/site";
import "./globals.css";

// Both quote the landing page; see src/site.ts.
const title = site.title;
const description = site.description;

export const metadata: Metadata = {
  metadataBase: new URL("https://lab.moumen.dev"),
  title: {
    default: title,
    template: "%s | moumenlab",
  },
  description,
  authors: [{ name: "Moumen Soliman", url: "https://moumen.dev" }],
  creator: "Moumen Soliman",
  // The page says who it is written for; the keywords say it too.
  keywords: [
    "moumenlab",
    "shadcn",
    "react components",
    "tailwind",
    "ui",
    "interaction design",
    "design engineers",
    "frontend engineers",
  ],
  // The SVG carries a prefers-color-scheme rule so the mark stays visible on a
  // dark tab strip; the PNG is the opaque fallback for Safari, which ignores
  // SVG favicons.
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "moumenlab",
    title,
    description,
    // No `images` here on purpose: app/opengraph-image.tsx supplies them, and
    // an explicit entry would override the generated one. Same for twitter,
    // which falls back to og:image when it has no image of its own.
  },
  twitter: {
    card: "summary_large_image",
    site: "@moumensoliman",
    creator: "@moumensoliman",
    title,
    description,
  },
  // What the browser paints around the page: the iOS status bar, Android's
  // task switcher, the Safari toolbar. These are media-driven rather than
  // attribute-driven, so a reader who has overruled their OS gets chrome that
  // matches the OS rather than the page. It is the one thing `data-theme`
  // cannot reach, and a one-off mismatch in the toolbar is a far smaller
  // problem than a white bar above a dark page for everyone else.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#101113" },
  ],
};

/* ── The first paint ───────────────────────────────────────────────────────
 * This runs before the browser has drawn anything, which is the whole point.
 * The theme lives in localStorage or in the OS, and neither is available to
 * the server, so the HTML arrives with no `data-theme` at all and the CSS
 * would default to light. For a reader on dark that is a white flash on every
 * single navigation - brief, but it is the first thing they see, and it is
 * exactly the thing they turned dark mode on to avoid.
 *
 * It is inline, and it is in <head>, because both are what make it beat the
 * paint. A module in a <script src> would be fetched and deferred, and by the
 * time it ran the flash would already have happened.
 *
 * Small enough to read in one go, and wrapped in a try/catch because
 * localStorage throws outright rather than returning null when a browser has
 * storage blocked - unhandled, that would take the theme down with it.
 */
const NO_FLASH = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning` covers exactly one attribute: the script above
    // writes `data-theme` onto this element before React ever sees it, so the
    // server's markup and the client's DOM disagree by design. It suppresses
    // the warning for this element's own attributes only, never for its
    // children, so nothing real gets hidden by it.
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        <OpenPanelComponent
          clientId={process.env.NEXT_PUBLIC_OPEN_PANEL_CLIENT_ID as string}
          trackScreenViews={true}
          trackAttributes={true}
          trackOutgoingLinks={true}
        /> {children}
        {/* Mounted at the root so ⌘K (or a bare D) reaches the whole registry
            from any page, the landing included. The list is plain serializable
            metadata, so the server hands it straight to the client component. */}
        <RegistryPalette components={components} />
      </body>
    </html>
  );
}
