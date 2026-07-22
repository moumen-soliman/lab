import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://lab.moumen.dev"),
  title: {
    default: "moumenlab — a component lab",
    template: "%s | moumenlab",
  },
  description:
    "Open-source interaction experiments by Moumen Soliman. Copy the source or install with npx moumenlab add.",
  authors: [{ name: "Moumen Soliman", url: "https://moumen.dev" }],
  icons: { icon: "/favicon.png" },
  openGraph: {
    type: "website",
    siteName: "moumenlab",
    images: [{ url: "/og-lab.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@moumensoliman",
    images: ["/og-lab.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
