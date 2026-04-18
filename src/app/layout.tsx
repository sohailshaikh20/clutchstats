import type { Metadata, Viewport } from "next";
import { DM_Sans, Rajdhani } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageFadeIn } from "@/components/layout/PageFadeIn";
import "./globals.css";

const fontHeading = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const fontBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = "https://clutchstats.gg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ClutchStats.gg — Valorant Stats, Esports & Squad Finder",
  description:
    "Premium Valorant player stats, VCT esports coverage, roadmaps, and rank-verified squad finder on ClutchStats.gg.",
  openGraph: {
    title: "ClutchStats.gg — Valorant Stats, Esports & Squad Finder",
    description:
      "Premium Valorant player stats, VCT esports coverage, roadmaps, and rank-verified squad finder on ClutchStats.gg.",
    url: siteUrl,
    siteName: "ClutchStats.gg",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ClutchStats.gg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClutchStats.gg — Valorant Stats, Esports & Squad Finder",
    description:
      "Premium Valorant player stats, VCT esports coverage, roadmaps, and rank-verified squad finder on ClutchStats.gg.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1923",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontBody.variable}`}
    >
      <body className="font-body">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="min-w-0 flex-1 overflow-x-clip pb-[4.75rem] md:pb-0">
            <PageFadeIn>{children}</PageFadeIn>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
