import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const title = "moumenlab — Less is more";
const description =
  "A small lab of the components we build every day, rethought for better feel. React + Tailwind, on the shadcn registry — copy the source or install with npx moumenlab add.";

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
  icons: { icon: "/favicon.png" },
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
      <body>{children}</body>
    </html>
  );
}
