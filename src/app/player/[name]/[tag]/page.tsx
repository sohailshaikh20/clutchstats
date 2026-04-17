import type { Metadata } from "next";
import { HenrikApiError, getHenrikClient } from "@/lib/api/henrik";
import { pageMetadata } from "@/lib/page-metadata";
import { AgentBreakdown } from "@/components/player/AgentBreakdown";
import { CoachingCta } from "@/components/player/CoachingCta";
import { MapPerformance } from "@/components/player/MapPerformance";
import { MatchHistory } from "@/components/player/MatchHistory";
import { PlayerNotFound } from "@/components/player/PlayerNotFound";
import { PlayerPrivacy } from "@/components/player/PlayerPrivacy";
import { ProfileErrorGeneric } from "@/components/player/ProfileErrorGeneric";
import { ProfileHeader } from "@/components/player/ProfileHeader";
import { StatsOverview } from "@/components/player/StatsOverview";
import {
  buildPlayerProfilePayload,
  isPrivacyHenrikError,
} from "@/lib/player/build-profile-payload";
import { defaultMmrResponse } from "@/lib/player/default-mmr";
import { fetchValorantGameAssets } from "@/lib/valorant/game-assets";
import type { HenrikMatch } from "@/types/valorant";
import type { ValorantRegion } from "@/types/valorant";

function asRegion(r: string): ValorantRegion {
  const x = r.toLowerCase();
  if (x === "latam" || x === "las") return "latam";
  if (x === "br" || x === "brazil") return "br";
  if (x === "na" || x === "eu" || x === "ap" || x === "kr") return x;
  return "na";
}

export async function generateMetadata({
  params,
}: {
  params: { name: string; tag: string };
}): Promise<Metadata> {
  const name = decodeURIComponent(params.name);
  const tag = decodeURIComponent(params.tag);
  const path = `/player/${params.name}/${params.tag}`;

  let client;
  try {
    client = getHenrikClient();
  } catch {
    return pageMetadata({
      title: `${name}#${tag} | ClutchStats.gg`,
      description: `Valorant profile lookup for ${name}#${tag} on ClutchStats.gg.`,
      path,
    });
  }

  try {
    const accountRes = await client.getAccount(name, tag);
    const account = accountRes.data;
    if (accountRes.status !== 200 || !account) {
      return pageMetadata({
        title: `${name}#${tag} | ClutchStats.gg`,
        description: `Valorant profile for ${name}#${tag} — stats, matches, and trends on ClutchStats.gg.`,
        path,
      });
    }
    return pageMetadata({
      title: `${account.name}#${account.tag} | ClutchStats.gg`,
      description: `Valorant profile for ${account.name}#${account.tag} — rank, match history, agents, and maps on ClutchStats.gg.`,
      path,
    });
  } catch {
    return pageMetadata({
      title: `${name}#${tag} | ClutchStats.gg`,
      description: `Valorant profile lookup for ${name}#${tag} on ClutchStats.gg.`,
      path,
    });
  }
}

export default async function PlayerProfilePage({
  params,
}: {
  params: { name: string; tag: string };
}) {
  const name = decodeURIComponent(params.name);
  const tag = decodeURIComponent(params.tag);

  let client;
  try {
    client = getHenrikClient();
  } catch {
    return (
      <ProfileErrorGeneric message="Player lookup is not configured on this deployment." />
    );
  }

  try {
    const accountRes = await client.getAccount(name, tag);
    const account = accountRes.data;
    const region = asRegion(account.region);

    const [assets, mmrRes, matchRes] = await Promise.all([
      fetchValorantGameAssets(),
      client.getMMR(region, name, tag).catch(() => null),
      client
        .getMatches(region, name, tag, { size: 30 })
        .catch(() => ({ data: [] as HenrikMatch[] })),
    ]);

    const mmr = mmrRes?.data ?? defaultMmrResponse();
    const matches = Array.isArray(matchRes.data) ? matchRes.data : [];

    const payload = buildPlayerProfilePayload(account, mmr, matches, assets);

    return (
      <div className="min-h-screen bg-background pb-10">
        <ProfileHeader
          cardWide={payload.cardWide}
          riotName={payload.riotName}
          riotTag={payload.riotTag}
          regionFlag={payload.regionFlag}
          accountLevel={payload.accountLevel}
          current={{
            name: payload.currentRank.name,
            rr: payload.currentRank.rr,
            mmrDelta: payload.currentRank.mmrDelta,
            largeIconUrl: payload.currentRank.largeIconUrl,
            glowColor: payload.currentRank.glowColor,
          }}
          peak={payload.peakRank}
        />

        <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8 xl:px-10">
          <StatsOverview
            kdRatio={payload.stats.kdRatio}
            winRate={payload.stats.winRate}
            headshotPct={payload.stats.headshotPct}
            avgCombatScore={payload.stats.avgCombatScore}
          />
        </div>

        <MatchHistory matches={payload.matches} />
        <AgentBreakdown agents={payload.agents} />
        <MapPerformance maps={payload.maps} />
        <CoachingCta />
      </div>
    );
  } catch (e) {
    if (e instanceof HenrikApiError) {
      if (isPrivacyHenrikError(e.message, e.status)) {
        return <PlayerPrivacy />;
      }
      if (e.status === 404) {
        return <PlayerNotFound defaultName={name} defaultTag={tag} />;
      }
      return <ProfileErrorGeneric message={e.message} />;
    }
    return (
      <ProfileErrorGeneric
        message={e instanceof Error ? e.message : "Something went wrong."}
      />
    );
  }
}
