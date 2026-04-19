import type {
  MatchDetail,
  MatchDetailMap,
  MatchDetailPlayer,
  MatchDetailRound,
  MatchDetailStream,
} from "./matches";

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function optionalStr(v: unknown): string | undefined {
  const s = str(v);
  return s || undefined;
}

function coercePlayer(raw: unknown): MatchDetailPlayer {
  const p = raw as Record<string, unknown>;
  return {
    team: str(p.team),
    player: str(p.player ?? p.name),
    agent: optionalStr(p.agent),
    rating: optionalStr(p.rating),
    acs: optionalStr(p.acs),
    kills: optionalStr(p.kills),
    deaths: optionalStr(p.deaths),
    assists: optionalStr(p.assists),
    kast: optionalStr(p.kast ?? p.kast_pct ?? p["kast%"]),
    adr: optionalStr(p.adr),
    hs_pct: optionalStr(p.hs_pct ?? p.hs),
    fk: optionalStr(p.fk ?? p.first_kills),
    fd: optionalStr(p.fd ?? p.first_deaths),
  };
}

function coerceMap(raw: unknown): MatchDetailMap | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const scoreRaw = m.score as Record<string, unknown> | undefined;
  const s1 = scoreRaw?.team1 as Record<string, unknown> | undefined;
  const s2 = scoreRaw?.team2 as Record<string, unknown> | undefined;
  const playersRaw = m.players;
  const players = Array.isArray(playersRaw)
    ? playersRaw.map(coercePlayer)
    : [];

  return {
    map_name: str(m.map_name ?? m.mapName ?? "Unknown"),
    picked_by: optionalStr(m.picked_by ?? m.pickedBy),
    duration: optionalStr(m.duration),
    score: {
      team1: {
        total: num(s1?.total ?? s1?.score),
        ct: num(s1?.ct),
        t: num(s1?.t),
      },
      team2: {
        total: num(s2?.total ?? s2?.score),
        ct: num(s2?.ct),
        t: num(s2?.t),
      },
    },
    players,
  };
}

function coerceRound(raw: unknown): MatchDetailRound | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const side1 = str(r.team1_side ?? r.team1Side).toLowerCase();
  const side2 = str(r.team2_side ?? r.team2Side).toLowerCase();
  return {
    round_number: num(r.round_number ?? r.roundNumber ?? r.n),
    team1_win: Boolean(r.team1_win ?? r.team1Win),
    team2_win: Boolean(r.team2_win ?? r.team2Win),
    team1_side: side1 === "t" ? "t" : "ct",
    team2_side: side2 === "t" ? "t" : "ct",
  };
}

function coerceStream(raw: unknown): MatchDetailStream | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const link = str(s.link ?? s.url);
  if (!link) return null;
  return { name: str(s.name ?? "Stream"), link };
}

/** Coerce loose JSON from vlrggapi into MatchDetail. */
export function coerceMatchDetail(raw: unknown): MatchDetail {
  const d =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const eventRaw = d.event as Record<string, unknown> | string | undefined;
  const teamsRaw = d.teams;
  const teams = Array.isArray(teamsRaw)
    ? teamsRaw.map((t) => {
        const tr = t as Record<string, unknown>;
        return {
          name: str(tr.name),
          score: num(tr.score),
          logo: optionalStr(tr.logo),
          flag: optionalStr(tr.flag),
        };
      })
    : [];

  const mapsRaw = d.maps;
  const maps: MatchDetailMap[] = Array.isArray(mapsRaw)
    ? mapsRaw.map(coerceMap).filter(Boolean) as MatchDetailMap[]
    : [];

  const roundsRaw = d.rounds;
  const rounds: MatchDetailRound[] = Array.isArray(roundsRaw)
    ? roundsRaw.map(coerceRound).filter(Boolean) as MatchDetailRound[]
    : [];

  const h2hRaw = d.head_to_head ?? d.headToHead;
  const head_to_head = Array.isArray(h2hRaw)
    ? h2hRaw
        .map((x) => {
          const h = x as Record<string, unknown>;
          return {
            event: str(h.event),
            match: str(h.match),
            score: str(h.score),
          };
        })
        .filter((h) => h.event || h.match)
    : [];

  const streamsRaw = d.streams;
  const streams: MatchDetailStream[] = Array.isArray(streamsRaw)
    ? streamsRaw.map(coerceStream).filter(Boolean) as MatchDetailStream[]
    : [];

  const st = str(d.status).toLowerCase();
  let status: MatchDetail["status"];
  if (st === "live" || st === "upcoming" || st === "completed") {
    status = st;
  } else {
    status = undefined;
  }

  const eventName =
    typeof eventRaw === "string"
      ? eventRaw
      : str((eventRaw as Record<string, unknown> | undefined)?.name ?? d.event_name);
  const eventSeries =
    typeof eventRaw === "string"
      ? str(d.series ?? d.series_name)
      : str((eventRaw as Record<string, unknown> | undefined)?.series ?? d.series_name ?? d.series);

  return {
    event: {
      name: eventName,
      series: eventSeries,
    },
    teams,
    maps: maps.length ? maps : [],
    rounds,
    head_to_head,
    streams,
    match_id: optionalStr(d.match_id ?? d.matchId),
    status,
  };
}
