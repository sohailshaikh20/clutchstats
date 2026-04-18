/**
 * Demo LFG posts shown when the real board is empty.
 * Illustrates the full range of features: rank, agents, playstyle, region, description.
 */
import type { LfgPostWithProfile } from "@/components/lfg/types";

const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000).toISOString();
const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 60 * 60 * 1000).toISOString();

export const DEMO_LFG_POSTS: LfgPostWithProfile[] = [
  {
    id: "demo-1",
    user_id: "demo",
    rank: "diamond",
    agents: ["Jett", "Neon", "Raze"],
    region: "eu",
    playstyle: "aggressive",
    description:
      "Diamond 2 duelist main looking for a structured 5-stack for ranked grind. I entry-frag and use util aggressively. Need IGL or support player. Mic required, chill vibes only.",
    available_from: "18:00",
    available_to: "23:00",
    created_at: hoursAgo(1),
    expires_at: hoursFromNow(23),
    profiles: {
      username: "stellarJett",
      avatar_url: null,
      current_rank: 20,
      riot_puuid: null,
      riot_name: "stellarJett",
      riot_tag: "EU1",
    },
  },
  {
    id: "demo-2",
    user_id: "demo",
    rank: "platinum",
    agents: ["Omen", "Astra", "Viper"],
    region: "na",
    playstyle: "support",
    description:
      "Plat 3 controller main — I smoke, lineups are on point. Looking for 1–2 duelists for comp. 3K+ hours, consistent 55% WR this act. East Coast server preferred.",
    available_from: "20:00",
    available_to: "01:00",
    created_at: hoursAgo(3),
    expires_at: hoursFromNow(21),
    profiles: {
      username: "omenSmoker",
      avatar_url: null,
      current_rank: 17,
      riot_puuid: null,
      riot_name: "omenSmoker",
      riot_tag: "NA1",
    },
  },
  {
    id: "demo-3",
    user_id: "demo",
    rank: "gold",
    agents: ["Sage", "Skye", "Breach"],
    region: "ap",
    playstyle: "support",
    description:
      "Gold 2 sentinel / initiator flex. 60% HS this act, avg ACS 180. Want a chill duo or trio for unrated and comp. No toxicity — just improving together.",
    available_from: "14:00",
    available_to: "20:00",
    created_at: hoursAgo(6),
    expires_at: hoursFromNow(18),
    profiles: {
      username: "sageMains",
      avatar_url: null,
      current_rank: 14,
      riot_puuid: null,
      riot_name: "sageMains",
      riot_tag: "AP1",
    },
  },
  {
    id: "demo-4",
    user_id: "demo",
    rank: "immortal",
    agents: ["Chamber", "Killjoy", "Cypher"],
    region: "na",
    playstyle: "flex",
    description:
      "Immo 1 sentinel OTP trying to push Immo 2+. Looking for comm-heavy teammates who call mid and rotate properly. VCT watching group welcome.",
    available_from: "19:00",
    available_to: "02:00",
    created_at: hoursAgo(9),
    expires_at: hoursFromNow(15),
    profiles: {
      username: "chamberMain",
      avatar_url: null,
      current_rank: 22,
      riot_puuid: null,
      riot_name: "chamberMain",
      riot_tag: "NA2",
    },
  },
  {
    id: "demo-5",
    user_id: "demo",
    rank: "silver",
    agents: ["Reyna", "Phoenix", "Jett"],
    region: "eu",
    playstyle: "aggressive",
    description:
      "Silver 3 aiming to reach gold this act. Average 220 ACS in last 10 games. Would love a duo who calls when to push vs. reset. EU West preferred.",
    available_from: "17:00",
    available_to: "22:00",
    created_at: hoursAgo(12),
    expires_at: hoursFromNow(12),
    profiles: {
      username: "reynaGrind",
      avatar_url: null,
      current_rank: 11,
      riot_puuid: null,
      riot_name: "reynaGrind",
      riot_tag: "EU3",
    },
  },
];
