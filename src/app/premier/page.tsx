import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { PremierLanding } from "@/components/premier/PremierLanding";

export const metadata: Metadata = pageMetadata({
  title: "Premier | ClutchStats.gg",
  description:
    "Browse Valorant Premier divisions, scout opponents, and track your team's ranking across every region on ClutchStats.gg.",
  path: "/premier",
});

export default function PremierPage() {
  return <PremierLanding />;
}
