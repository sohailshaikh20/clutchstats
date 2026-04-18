import { getVLRClient } from "@/lib/api/vlr";
import type { VLRMatch, VLRResult } from "@/types/esports";
import type {
  ClutchMatchDetailPayload,
  ClutchMatchMapDetail,
  ClutchPlayerStatRow,
  ClutchRoundOutcome,
} from "@/types/clutch-match-detail";

const MAP_POOL = [
  "Haven",
  "Ascent",
  "Split",
  "Bind",
  "Lotus",
  "Sunset",
  "Icebox",
  "Breeze",
  "Fracture",
  "Pearl",
] as const;

const NAME_POOL = [
  "nAts",
  "aspas",
  "Derke",
  "TenZ",
  "yay",
  "Less",
  "Chronicle",
  "Boaster",
  "leaf",
  "bang",
] as const;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function roundOutcome(rng: () => number, aWonRound: boolean): ClutchRoundOutcome {
  const roll = rng();
  if (aWonRound) {
    return roll > 0.72 ? "a_spike" : "a_elim";
  }
  return roll > 0.68 ? "b_defuse" : "b_elim";
}

function buildHalfSummary(
  rng: () => number,
  aTotal: number,
  bTotal: number,
  aStartDefense: boolean
): string {
  const half = 12;
  const r1 = Math.min(half, aTotal + bTotal);
  let a1 = Math.round(aTotal * (r1 / (aTotal + bTotal || 1)) * (0.45 + rng() * 0.2));
  a1 = Math.max(0, Math.min(half, a1));
  const b1 = r1 - a1;
  const a2 = aTotal - a1;
  const b2 = bTotal - b1;
  const ctFirst = aStartDefense ? "CT" : "T";
  const tFirst = aStartDefense ? "T" : "CT";
  return `(${ctFirst} ${a1}-${b1}, ${tFirst} ${a2}-${b2})`;
}

function synthPlayers(
  rng: () => number,
  teamTag: string,
  count: number,
  startIdx: number
): ClutchPlayerStatRow[] {
  const rows: ClutchPlayerStatRow[] = [];
  for (let i = 0; i < count; i++) {
    const base = pick(rng, NAME_POOL);
    const name = `${base} (${teamTag})`;
    const rating = 0.65 + rng() * 0.75;
    const acs = 160 + rng() * 120;
    const kills = Math.round(10 + rng() * 22);
    const deaths = Math.round(8 + rng() * 18);
    const assists = Math.round(2 + rng() * 12);
    const plusMinus = kills - deaths;
    const kast = 55 + rng() * 38;
    const adr = 120 + rng() * 90;
    const hsPct = 8 + rng() * 42;
    const fk = Math.round(rng() * 7);
    const fd = Math.round(rng() * 7);
    rows.push({
      playerId: `s-${startIdx + i}`,
      name,
      agentIcon: null,
      rating,
      acs,
      kills,
      deaths,
      assists,
      plusMinus,
      kastPct: kast,
      adr,
      hsPct,
      fk,
      fd,
    });
  }
  return rows;
}

function buildRoundsAndEconomy(
  rng: () => number,
  aMaps: number,
  bMaps: number
): Pick<ClutchMatchMapDetail, "rounds" | "economyA" | "economyB"> {
  const total = aMaps + bMaps;
  const rounds: ClutchMatchMapDetail["rounds"] = [];
  let ecoA = 4000;
  let ecoB = 4000;
  const economyA: number[] = [];
  const economyB: number[] = [];
  for (let n = 1; n <= total; n++) {
    const aWins = rng() < aMaps / (aMaps + bMaps || 1);
    const outcome = roundOutcome(rng, aWins);
    rounds.push({ n, outcome, winner: aWins ? "a" : "b" });
    ecoA += Math.round((aWins ? 3000 : -1500) * (0.4 + rng()));
    ecoB += Math.round((!aWins ? 3000 : -1500) * (0.4 + rng()));
    ecoA = Math.max(500, Math.min(9000, ecoA));
    ecoB = Math.max(500, Math.min(9000, ecoB));
    economyA.push(ecoA);
    economyB.push(ecoB);
  }
  return { rounds, economyA, economyB };
}

function mapSequenceSimple(
  rng: () => number,
  mapsWonA: number,
  mapsWonB: number
): { a: number; b: number }[] {
  const wins: Array<"a" | "b"> = [];
  for (let i = 0; i < mapsWonA; i++) wins.push("a");
  for (let j = 0; j < mapsWonB; j++) wins.push("b");
  for (let i = wins.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = wins[i]!;
    wins[i] = wins[j]!;
    wins[j] = tmp;
  }
  return wins.map((w) => {
    const loser = 3 + Math.floor(rng() * 9);
    return w === "a" ? { a: 13, b: loser } : { a: loser, b: 13 };
  });
}

function seriesWinnerIsTeam1(r: VLRResult): boolean {
  const w = (r.winner || "").toLowerCase();
  const n1 = r.team1.name.toLowerCase();
  return w === n1 || w.includes(n1) || n1.includes(w);
}

export async function buildClutchMatchDetail(matchId: string): Promise<ClutchMatchDetailPayload | null> {
  const client = getVLRClient();

  let status: ClutchMatchDetailPayload["summary"]["status"] = "completed";
  let unixTs: number | null = null;
  let timeLabel = "";
  let tournament = "";
  let event = "";
  let eventImg = "";
  let teamA = { name: "Team A", score: null as number | null, won: false };
  let teamB = { name: "Team B", score: null as number | null, won: false };

  let result: VLRResult | null = null;
  for (let page = 1; page <= 12; page++) {
    try {
      const res = await client.getResults(page);
      const hit = res.data.find((r) => r.id === matchId);
      if (hit) {
        result = hit;
        break;
      }
      if (res.data.length === 0) break;
    } catch {
      break;
    }
  }

  if (result) {
    tournament = result.event?.name ?? "";
    event = result.series?.full_name ?? result.series?.name ?? "";
    eventImg = result.event?.logo ?? "";
    unixTs = result.unix_timestamp || null;
    timeLabel = result.time_completed ?? "";
    const t1won = seriesWinnerIsTeam1(result);
    teamA = {
      name: result.team1.name,
      score: result.team1.score,
      won: t1won,
    };
    teamB = {
      name: result.team2.name,
      score: result.team2.score,
      won: !t1won,
    };
    status = "completed";
  } else {
    try {
      const [liveRes, upRes] = await Promise.all([
        client.getLiveMatches().catch(() => ({ data: [] as VLRMatch[] })),
        client.getUpcomingMatches().catch(() => ({ data: [] as VLRMatch[] })),
      ]);
      const all = [...liveRes.data, ...upRes.data];
      const m = all.find((x) => x.id === matchId);
      if (!m) return null;
      tournament = m.event?.name ?? "";
      event = m.series?.full_name ?? m.series?.name ?? "";
      eventImg = m.event?.logo ?? "";
      unixTs = m.unix_timestamp;
      timeLabel = m.time_until_match ?? "";
      const s1 = m.team1.score;
      const s2 = m.team2.score;
      const live = m.status === "live";
      status = live ? "live" : "upcoming";
      teamA = {
        name: m.team1.name,
        score: s1,
        won: false,
      };
      teamB = {
        name: m.team2.name,
        score: s2,
        won: false,
      };
    } catch {
      return null;
    }
  }

  const idNum = Number(matchId) || 0;
  const rng = mulberry32(idNum || 1337);

  const sA = teamA.score ?? 0;
  const sB = teamB.score ?? 0;
  const mapsWonA = status === "completed" ? sA : 0;
  const mapsWonB = status === "completed" ? sB : 0;

  const maps: ClutchMatchMapDetail[] = [];

  if (status === "upcoming") {
    maps.push({
      index: 0,
      mapName: "Map 1 (TBD)",
      teamAScore: 0,
      teamBScore: 0,
      halfSummary: "(Picks & bans after veto)",
      rounds: [],
      economyA: [],
      economyB: [],
      teamAPlayers: [],
      teamBPlayers: [],
    });
  } else if (status === "live") {
    const sc = { a: sA || 0, b: sB || 0 };
    const mapName = MAP_POOL[idNum % MAP_POOL.length]!;
    const halfSummary = buildHalfSummary(rng, sc.a, sc.b, rng() > 0.5);
    const { rounds, economyA, economyB } =
      sc.a + sc.b > 0 ? buildRoundsAndEconomy(rng, sc.a, sc.b) : { rounds: [], economyA: [], economyB: [] };
    maps.push({
      index: 0,
      mapName,
      teamAScore: sc.a,
      teamBScore: sc.b,
      halfSummary,
      rounds,
      economyA,
      economyB,
      teamAPlayers: synthPlayers(rng, "A", 5, 0),
      teamBPlayers: synthPlayers(rng, "B", 5, 50),
    });
  } else {
    if (mapsWonA + mapsWonB === 0) {
      maps.push({
        index: 0,
        mapName: MAP_POOL[idNum % MAP_POOL.length]!,
        teamAScore: 0,
        teamBScore: 0,
        halfSummary: "(Score pending)",
        rounds: [],
        economyA: [],
        economyB: [],
        teamAPlayers: [],
        teamBPlayers: [],
      });
    } else {
    const mapCount = mapsWonA + mapsWonB;
    const scores = mapSequenceSimple(rng, mapsWonA, mapsWonB);
    for (let i = 0; i < mapCount; i++) {
      const mapName = MAP_POOL[(idNum + i) % MAP_POOL.length]!;
      const sc = scores[i] ?? { a: 13, b: 9 };
      const aStartDefense = rng() > 0.5;
      const halfSummary = buildHalfSummary(rng, sc.a, sc.b, aStartDefense);
      const { rounds, economyA, economyB } = buildRoundsAndEconomy(rng, sc.a, sc.b);
      const teamAPlayers = synthPlayers(rng, "A", 5, i * 10);
      const teamBPlayers = synthPlayers(rng, "B", 5, i * 10 + 50);
      maps.push({
        index: i,
        mapName,
        teamAScore: sc.a,
        teamBScore: sc.b,
        halfSummary,
        rounds,
        economyA,
        economyB,
        teamAPlayers,
        teamBPlayers,
      });
    }
    }
  }

  return {
    ok: true,
    demoStats: true,
    summary: {
      id: matchId,
      teamA,
      teamB,
      tournament,
      event,
      eventImg,
      status,
      unixTimestamp: unixTs,
      timeLabel,
      vodUrl: null,
    },
    maps,
  };
}
