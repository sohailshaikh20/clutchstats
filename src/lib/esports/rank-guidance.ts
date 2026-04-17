export type RankGuidance = {
  skills: string[];
  mistakes: string[];
  agentNames: string[];
  training: string;
  eta: string;
};

/** Keys match normalized Valorant `tierName` (lowercase, no spaces). */
export const RANK_GUIDANCE: Record<string, RankGuidance> = {
  iron: {
    skills: ["Crosshair at head level while moving", "Stop before shooting bursts", "Learn one map callout set"],
    mistakes: ["Spraying while running full speed", "Ignoring spike timings", "Peeking without clearing angles"],
    agentNames: ["Sage", "Brimstone", "Phoenix"],
    training: "Aim trainers: 10 min/day on tracking. Deathmatch: 2 games focusing on tap firing.",
    eta: "2–4 weeks with daily games",
  },
  bronze: {
    skills: ["Pre-aim common angles", "Basic economy awareness", "Trade fragging with teammates"],
    mistakes: ["Saving on full buy rounds", "Wide swinging alone", "No comms on enemy utility"],
    agentNames: ["Omen", "Killjoy", "Reyna"],
    training: "Range: 50 bots on medium. Play one map until you know every smoke timing.",
    eta: "3–5 weeks with structured warm-up",
  },
  silver: {
    skills: ["Jiggle peeking for info", "Default plants and post-plant positions", "Rotating on sound cues"],
    mistakes: ["Stacking sites with no lurk", "Chasing kills after spike down", "Random duels mid-round"],
    agentNames: ["Viper", "Sova", "Raze"],
    training: "VOD review: 1 match/week noting 3 deaths. Aim routine: 15 min/day.",
    eta: "4–8 weeks; focus on decision-making",
  },
  gold: {
    skills: ["Crosshair placement", "Basic utility usage", "Map awareness and minimap checks"],
    mistakes: ["Over-peeking", "Not using abilities on execute", "Solo pushing without info"],
    agentNames: ["Fade", "Breach", "Chamber"],
    training: "Aim trainers: 15 min/day. VOD review: 1 match/week. Spike plant practice in customs.",
    eta: "2–4 weeks with consistent practice",
  },
  platinum: {
    skills: ["Utility for teammates, not solo plays", "Anchor swaps and retake paths", "Anti-eco discipline"],
    mistakes: ["Greeding for stats on anti-eco", "Over-rotating on one noise", "Weak comms on half buys"],
    agentNames: ["Harbor", "Skye", "Gekko"],
    training: "Scrims or ranked 5-stack when possible. Review pro VODs on your main map.",
    eta: "1–3 months depending on teamplay",
  },
  diamond: {
    skills: ["Adaptive utility lineups", "Mid-round calling", "Pressure without overextension"],
    mistakes: ["Defaulting same path every round", "Tilting after lost clutches", "Ignoring enemy patterns"],
    agentNames: ["Jett", "Cypher", "Astra"],
    training: "Demo analysis + aimlabs scenario drills. Limit ranked to fresh mental blocks.",
    eta: "2–4 months; prioritize consistency over volume",
  },
  ascendant: {
    skills: ["Team tempo and pacing", "Advanced lurk timing", "Coordinated utility dumps"],
    mistakes: ["Hero plays on bad economy", "Under-respecting operator angles", "Loose scrim habits in ranked"],
    agentNames: ["Yoru", "Neon", "Iso"],
    training: "Team practice + individual duel servers. Record comms and trim filler callouts.",
    eta: "3–6 months at high focus",
  },
  immortal: {
    skills: ["Round win condition planning", "Adaptive defaults", "Clutch fundamentals under pressure"],
    mistakes: ["Ego duels when spike needs moving", "Weak anti-tilt resets", "Skipping sleep for grind"],
    agentNames: ["Jett", "Omen", "Killjoy"],
    training: "High-quality ranked blocks + coach feedback. Aim maintenance, not marathon grinds.",
    eta: "6+ months; gains are incremental",
  },
  radiant: {
    skills: ["Leadership and shot-calling", "Meta adaptation each patch", "Mental resilience at pro pace"],
    mistakes: ["Autopiloting familiar maps", "Neglecting physical recovery", "Isolation from team scene"],
    agentNames: ["Any — mastery over pick", "Flex picks for team comp", "Op on comfort maps"],
    training: "Structured team blocks, VCT VOD study, LAN/scrim exposure where possible.",
    eta: "Ongoing — Radiant is maintenance + networking",
  },
};

export function normalizeRankKey(tierName: string): string {
  return tierName.replace(/[^a-z0-9]+/gi, "").toLowerCase();
}

export function getGuidanceForRank(tierName: string): RankGuidance {
  const key = normalizeRankKey(tierName);
  return (
    RANK_GUIDANCE[key] ?? {
      skills: ["Consistent crosshair discipline", "Utility that supports the team", "Clear comms"],
      mistakes: ["Taking fights without win condition", "Peeking multiple angles", "Ignoring economy"],
      agentNames: ["Sage", "Brimstone", "Phoenix"],
      training: "Mix ranked with deliberate practice: 15 min aim + 1 reviewed match per session.",
      eta: "Varies — track one skill per week",
    }
  );
}
