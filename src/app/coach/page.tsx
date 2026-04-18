import { CoachLandingDemo } from "@/components/coach/CoachLandingDemo";
import { CoachPremiumExperience } from "@/components/coach/CoachPremiumExperience";
import { getAgents, getMaps } from "@/lib/api/assets";
import { profileIsPremium } from "@/lib/coach/premium";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "AI Coach | ClutchStats.gg",
  description:
    "Premium Valorant AI coaching — map and agent insights, weekly goals, and performance trends from your last 20 matches.",
  path: "/coach",
});

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <CoachLandingDemo />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("riot_name, riot_tag, riot_puuid, region, username, is_premium, premium_until")
    .eq("id", user.id)
    .single();

  if (!profile || !profileIsPremium(profile)) {
    return <CoachLandingDemo />;
  }

  let agents: Awaited<ReturnType<typeof getAgents>> = [];
  let maps: Awaited<ReturnType<typeof getMaps>> = [];
  try {
    const [a, m] = await Promise.all([getAgents(true), getMaps()]);
    agents = a.filter((x) => x.isPlayableCharacter);
    maps = m;
  } catch (e) {
    console.error("[coach] asset load failed", e);
  }

  const { data: sessions } = await supabase
    .from("coaching_sessions")
    .select("id, created_at, insights_summary, analysis, stats_snapshot")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(15);

  const rawList = sessions ?? [];
  const initialSummaries = rawList.map((s) => ({
    id: s.id,
    created_at: s.created_at,
    insights_summary: s.insights_summary,
  }));
  const initialLatest = rawList[0] ?? null;

  return (
    <CoachPremiumExperience
      maps={maps}
      agents={agents}
      initialSummaries={initialSummaries}
      initialLatest={initialLatest}
      initialProfile={{
        riot_name: profile.riot_name,
        riot_tag: profile.riot_tag,
        riot_puuid: profile.riot_puuid,
        region: profile.region,
        username: profile.username,
      }}
    />
  );
}
