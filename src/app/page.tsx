import type { Metadata } from "next";
import HomeLanding from "@/components/landing/HomeLanding";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "ClutchStats.gg — Competitive Gaming Stats, Esports & AI Coaching",
  description:
    "Premium competitive gaming stats for Valorant and more — esports coverage, roadmaps, squad finder, and AI coaching.",
  path: "/",
});

export default HomeLanding;
