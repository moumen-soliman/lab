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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
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
