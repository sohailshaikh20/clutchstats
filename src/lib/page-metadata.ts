import type { Metadata } from "next";

const OG_IMAGE = {
  url: "/opengraph-image" as const,
  width: 1200,
  height: 630,
  alt: "ClutchStats.gg",
};

/** Route-level Open Graph + Twitter cards (metadataBase is set in root layout). */
export function pageMetadata(input: {
  title: string;
  description: string;
  /** Path only, e.g. `/lfg` (metadataBase supplies origin). */
  path: string;
}): Metadata {
  const { title, description, path } = input;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: path,
      siteName: "ClutchStats.gg",
      locale: "en_US",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
