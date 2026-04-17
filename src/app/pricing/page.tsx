import { PricingPageClient } from "@/components/pricing/PricingPageClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Pricing | ClutchStats.gg",
  description:
    "ClutchStats Free vs Pro — AI coaching, premium LFG, and advanced analytics. EUR 6.99/month or EUR 59.99/year with a 7-day free trial.",
  path: "/pricing",
});

export default function PricingPage() {
  return <PricingPageClient />;
}
