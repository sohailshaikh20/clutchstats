import type { Metadata } from "next";
import { EsportsHub } from "@/components/esports/EsportsHub";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Esports | ClutchStats.gg",
  description:
    "VCT live scores, results, regional rankings, and events — Valorant esports coverage powered by VLR data on ClutchStats.gg.",
  path: "/esports",
});

export default function EsportsPage() {
  return <EsportsHub />;
}
