import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { OpenPanelComponent } from '@openpanel/nextjs';
import "./globals.css";

const title = "moumenlab - Less is more";
const description =
  "A small lab of the components we build every day, rethought for better feel. React + Tailwind, on the shadcn registry - copy the source or install with npx moumenlab add.";

export const metadata: Metadata = {
  metadataBase: new URL("https://lab.moumen.dev"),
  title: {
    default: title,
    template: "%s | moumenlab",
  },
  description,
  authors: [{ name: "Moumen Soliman", url: "https://moumen.dev" }],
  creator: "Moumen Soliman",
  keywords: [
    "moumenlab",
    "shadcn",
    "react components",
    "tailwind",
    "ui",
    "interaction design",
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
    images: [{ url: "/og-lab.png?v=2", width: 1200, height: 630, alt: "moumenlab" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@moumensoliman",
    creator: "@moumensoliman",
    title,
    description,
    images: ["/og-lab.png?v=2"],
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
        /> {children}</body>
    </html>
  );
}
