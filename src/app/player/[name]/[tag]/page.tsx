import type { Metadata } from "next";
import { HenrikApiError, getHenrikClient } from "@/lib/api/henrik";
import { buildPerformanceStats } from "@/app/player/[name]/[tag]/build-performance-stats";
import { buildProfileHeaderData } from "@/app/player/[name]/[tag]/profile-header-data";
import { AgentsTable } from "@/components/player/AgentsTable";
import { buildAgentsTableData } from "@/lib/adapters/build-agents-table-data";
import { MapPerformance } from "@/components/player/MapPerformance";
import { MatchHistory } from "@/components/player/MatchHistory";
import { matchRowsToMatches } from "@/lib/adapters/match";
import { ModeBreakdownPills } from "@/components/player/ModeBreakdownPills";
import { CompareBlock } from "@/components/player/CompareBlock";
import { buildCompareRows } from "@/lib/player/build-compare-rows";
import { PlayerNotFound } from "@/components/player/PlayerNotFound";
import { PlayerPrivacy } from "@/components/player/PlayerPrivacy";
import { ProfileErrorGeneric } from "@/components/player/ProfileErrorGeneric";
import { ProfileFooterActions } from "@/components/player/ProfileFooterActions";
import { ProfileHeader } from "@/components/player/ProfileHeader";
import { ProfileTabs } from "@/components/player/ProfileTabs";
import { PerformanceGrid } from "@/components/player/PerformanceGrid";
import { ProfileKdTrendChart, type TrendPoint } from "@/components/player/ProfileKdTrendChart";
import {
  buildPlayerProfilePayload,
  isPrivacyHenrikError,
  type MatchRow,
} from "@/lib/player/build-profile-payload";
import { defaultMmrResponse } from "@/lib/player/default-mmr";
import { pageMetadata } from "@/lib/page-metadata";
import { calculatePlayerStats } from "@/lib/stats/calculator";
import { fetchValorantGameAssets } from "@/lib/valorant/game-assets";
import type { HenrikMatch, ValorantRegion } from "@/types/valorant";

function asRegion(r: string): ValorantRegion {
  const x = r.toLowerCase();
  if (x === "latam" || x === "las") return "latam";
  if (x === "br" || x === "brazil") return "br";
  if (x === "na" || x === "eu" || x === "ap" || x === "kr") return x;
  return "na";
}

function tierDisplayLabel(patched: string | null): string {
  if (!patched) return "Tier";
  const first = patched.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : "Tier";
}

function buildTrendPoints(matches: MatchRow[]): TrendPoint[] {
  const nonDm = matches.filter((m) => m.filterQueue !== "deathmatch");
  const oldest = [...nonDm].sort((a, b) => a.gameStart - b.gameStart).slice(-18);
  return oldest.map((m, i) => ({
    i: i + 1,
    kd: m.kd,
    acs: m.combatScore > 0 ? m.combatScore : null,
  }));
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
    const rankPatched = mmr.current_data.currenttierpatched ?? null;
    const statsCalc = calculatePlayerStats(matches, account.puuid, rankPatched);
    const trendData = buildTrendPoints(payload.matches);
    const headerData = buildProfileHeaderData(payload, statsCalc, mmr, payload.matches);
    const performanceStats = buildPerformanceStats(statsCalc, rankPatched, payload.matches);
    const isProUser = false;
    const tierLabel = tierDisplayLabel(rankPatched);
    const agentsData = buildAgentsTableData({
      agentRows: payload.agents,
      henrikMatches: matches,
      puuid: account.puuid,
      mapsByKey: assets.mapsByKey,
      agentsByUuid: assets.agentsByUuid,
      agentsByName: assets.agentsByName,
    });
    const compareRows = buildCompareRows(statsCalc.premium.performancePercentile, rankPatched);
    const compareTier = tierDisplayLabel(rankPatched);

    return (
      <div className="min-h-screen bg-background pb-8">
        <ProfileHeader data={headerData} />
        <ProfileTabs />

        <section id="overview" className="scroll-mt-[120px]">
          <PerformanceGrid stats={performanceStats} isProUser={isProUser} tierLabel={tierLabel} />
          <div className="mx-auto w-full max-w-screen-2xl space-y-5 px-4 pb-8 pt-2 sm:px-6 lg:px-8 xl:px-10">
            <ProfileKdTrendChart data={trendData} />
          </div>
          <ModeBreakdownPills modes={statsCalc.premium.modeBreakdown} />
        </section>

        <section id="matches" className="scroll-mt-[120px]">
          <MatchHistory matches={matchRowsToMatches(payload.matches, matches, account.puuid)} />
        </section>

        <AgentsTable agents={agentsData} />

        <section id="maps" className="scroll-mt-[120px]">
          <MapPerformance maps={payload.maps} />
        </section>

        <section id="weapons" className="scroll-mt-[120px]">
          <div className="py-12 text-center font-body text-sm text-white/30">
            Weapons breakdown coming soon
          </div>
        </section>

        <section id="compare" className="scroll-mt-[120px]">
          <CompareBlock tier={compareTier} rows={compareRows} />
        </section>

        <ProfileFooterActions riotName={payload.riotName} riotTag={payload.riotTag} />
      </div>
    );
  } catch (e) {
    if (e instanceof HenrikApiError) {
      console.error(`[PlayerProfilePage] HenrikApiError status=${e.status} name=${name} tag=${tag}:`, e.message);
      if (isPrivacyHenrikError(e.message, e.status)) {
        return <PlayerPrivacy />;
      }
      if (e.status === 404) {
        return <PlayerNotFound defaultName={name} defaultTag={tag} />;
      }
      return <ProfileErrorGeneric message={e.message} />;
    }
    console.error(`[PlayerProfilePage] Unexpected error for ${name}#${tag}:`, e);
    return (
      <ProfileErrorGeneric
        message={e instanceof Error ? e.message : "Something went wrong."}
      />
    );
  }
}
