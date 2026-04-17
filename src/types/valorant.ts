// ─── Account ────────────────────────────────────────────────────────────────

export interface HenrikAccount {
  puuid: string;
  name: string;
  tag: string;
  region: string;
  account_level: number;
  card: {
    small: string;
    large: string;
    wide: string;
    id: string;
  };
  last_update: string;
  last_update_raw: number;
}

// ─── MMR ─────────────────────────────────────────────────────────────────────

export interface HenrikMMR {
  currenttier: number;
  currenttierpatched: string;
  ranking_in_tier: number;
  mmr_change_to_last_game: number;
  elo: number;
  games_needed_for_rating: number;
  old: boolean;
}

export interface HenrikMMRResponse {
  current_data: HenrikMMR;
  highest_rank: {
    patched_tier: string;
    tier: number;
    season: string;
  };
  by_season: Record<
    string,
    {
      error: boolean;
      wins: number;
      number_of_games: number;
      final_rank: number;
      final_rank_patched: string;
      act_rank_wins: Array<{ patched_tier: string; tier: number }>;
      old: boolean;
    }
  >;
}

// ─── Match ───────────────────────────────────────────────────────────────────

export interface MatchMetadata {
  map: string;
  game_version: string;
  game_length: number;
  game_start: number;
  game_start_patched: string;
  rounds_played: number;
  mode: string;
  mode_id: string;
  queue: string;
  season_id: string;
  platform: string;
  matchid: string;
  premier_info: {
    tournament_id: string;
    matchup_id: string;
  };
  region: string;
  cluster: string;
}

export interface MatchPlayerStats {
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  bodyshots: number;
  headshots: number;
  legshots: number;
}

export interface AbilityCasts {
  c_cast: number | null;
  q_cast: number | null;
  e_cast: number | null;
  x_cast: number | null;
}

export interface MatchPlayer {
  puuid: string;
  name: string;
  tag: string;
  team: string;
  level: number;
  character: string;
  currenttier: number;
  currenttier_patched: string;
  player_card: string;
  player_title: string;
  party_id: string;
  session_playtime: {
    minutes: number;
    seconds: number;
    milliseconds: number;
  };
  behavior: {
    afk_rounds: number;
    friendly_fire: { incoming: number; outgoing: number };
    rounds_in_spawn: number;
  };
  platform: {
    type: string;
    os: { name: string; version: string };
  };
  ability_casts: AbilityCasts;
  assets: {
    card: { small: string; large: string; wide: string };
    agent: { small: string; bust: string; full: string; killfeed: string };
  };
  stats: MatchPlayerStats;
  economy: {
    spent: { overall: number; average: number };
    loadout_value: { overall: number; average: number };
  };
  damage_made: number;
  damage_received: number;
}

export interface PlayerLocation {
  player_puuid: string;
  player_display_name: string;
  player_team: string;
  location: { x: number; y: number };
  view_radians: number;
}

export interface KillEvent {
  kill_time_in_round: number;
  kill_time_in_match: number;
  killer_puuid: string;
  killer_display_name: string;
  killer_team: string;
  victim_puuid: string;
  victim_display_name: string;
  victim_team: string;
  victim_death_location: { x: number; y: number };
  damage_weapon_id: string;
  damage_weapon_name: string;
  damage_weapon_assets: { display_icon: string; killfeed_icon: string };
  secondary_fire_mode: boolean;
  player_locations_on_kill: PlayerLocation[];
  assistants: Array<{
    assistant_puuid: string;
    assistant_display_name: string;
    assistant_team: string;
  }>;
}

export interface RoundPlayerStats {
  ability_casts: AbilityCasts;
  player_puuid: string;
  player_display_name: string;
  player_team: string;
  damage_events: Array<{
    receiver_puuid: string;
    receiver_display_name: string;
    receiver_team: string;
    bodyshots: number;
    damage: number;
    headshots: number;
    legshots: number;
  }>;
  damage: number;
  bodyshots: number;
  headshots: number;
  legshots: number;
  kill_events: KillEvent[];
  kills: number;
  score: number;
  economy: {
    loadout_value: number;
    weapon: {
      id: string;
      name: string;
      assets: { display_icon: string; killfeed_icon: string };
    };
    armor: { id: string; name: string; assets: { display_icon: string } } | null;
    remaining: number;
    spent: number;
  };
  was_afk: boolean;
  was_penalized: boolean;
  stayed_in_spawn: boolean;
}

export interface Round {
  winning_team: string;
  end_type: string;
  bomb_planted: boolean;
  bomb_defused: boolean;
  plant_events: {
    plant_location: { x: number; y: number } | null;
    planted_by: { puuid: string; display_name: string; team: string } | null;
    plant_site: string;
    plant_time_in_round: number;
    player_locations_on_plant: PlayerLocation[];
  };
  defuse_events: {
    defuse_location: { x: number; y: number } | null;
    defused_by: { puuid: string; display_name: string; team: string } | null;
    defuse_time_in_round: number;
    player_locations_on_defuse: PlayerLocation[];
  };
  player_stats: RoundPlayerStats[];
}

export interface MatchTeam {
  has_won: boolean;
  rounds_won: number;
  rounds_lost: number;
  roaster: {
    members: string[];
    name: string;
    tag: string;
    customization: {
      icon: string;
      image: string;
      primary: string;
      secondary: string;
      tertiary: string;
    };
  } | null;
}

export interface HenrikMatch {
  metadata: MatchMetadata;
  players: {
    all_players: MatchPlayer[];
    red: MatchPlayer[];
    blue: MatchPlayer[];
  };
  observers: Array<{
    puuid: string;
    name: string;
    tag: string;
    platform: { type: string; os: { name: string; version: string } };
    session_playtime: { minutes: number; seconds: number; milliseconds: number };
    team: string;
    level: number;
    player_card: string;
    player_title: string;
    party_id: string;
  }>;
  coaches: Array<{ puuid: string; team: string }>;
  teams: {
    red: MatchTeam;
    blue: MatchTeam;
  };
  rounds: Round[];
  kills: Array<KillEvent & { round: number }>;
}

// ─── Agents ──────────────────────────────────────────────────────────────────

export interface AgentAbility {
  slot: string;
  displayName: string;
  description: string;
  displayIcon: string | null;
}

export interface AgentRole {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
  assetPath: string;
}

export interface Agent {
  uuid: string;
  displayName: string;
  description: string;
  developerName: string;
  characterTags: string[] | null;
  displayIcon: string;
  displayIconSmall: string;
  bustPortrait: string;
  fullPortrait: string;
  fullPortraitV2: string;
  killfeedPortrait: string;
  background: string;
  backgroundGradientColors: string[];
  assetPath: string;
  isFullPortraitRightFacing: boolean;
  isPlayableCharacter: boolean;
  isAvailableForTest: boolean;
  isBaseContent: boolean;
  role: AgentRole;
  recruitmentData: null | {
    counterId: string;
    milestoneId: string;
    milestoneThreshold: number;
    useLevelVpCostOverride: boolean;
    levelVpCostOverride: number;
    startDate: string;
    endDate: string;
  };
  abilities: AgentAbility[];
  voiceLine: null | {
    minDuration: number;
    maxDuration: number;
    mediaList: Array<{ language: string; wwise: string; opus: string }>;
  };
}

// ─── Maps ─────────────────────────────────────────────────────────────────────

export interface ValorantMap {
  uuid: string;
  displayName: string;
  narrativeDescription: string | null;
  tacticalDescription: string | null;
  coordinates: string | null;
  displayIcon: string | null;
  listViewIcon: string;
  listViewIconTall: string | null;
  splash: string;
  stylizedDisplayName: string;
  mapUrl: string;
  xMultiplier: number;
  yMultiplier: number;
  xScalarToAdd: number;
  yScalarToAdd: number;
  callouts: Array<{
    regionName: string;
    superRegionName: string;
    location: { x: number; y: number };
  }> | null;
  assetPath: string;
}

// ─── Competitive Tiers ────────────────────────────────────────────────────────

export interface CompetitiveTier {
  tier: number;
  tierName: string;
  division: string;
  divisionName: string;
  color: string;
  backgroundColor: string;
  smallIcon: string | null;
  largeIcon: string | null;
  rankTriangleDownIcon: string | null;
  rankTriangleUpIcon: string | null;
}

export interface CompetitiveTierSet {
  uuid: string;
  assetObjectName: string;
  tiers: CompetitiveTier[];
  assetPath: string;
}

// ─── Weapons ─────────────────────────────────────────────────────────────────

export interface Weapon {
  uuid: string;
  displayName: string;
  category: string;
  defaultSkinUuid: string;
  displayIcon: string;
  killStreamIcon: string;
  assetPath: string;
  weaponStats: {
    fireRate: number;
    magazineSize: number;
    runSpeedMultiplier: number;
    equipTimeSeconds: number;
    reloadTimeSeconds: number;
    firstBulletAccuracy: number;
    shotgunPelletCount: number;
    wallPenetration: string;
    feature: string | null;
    fireMode: string | null;
    altFireType: string | null;
    adsStats: {
      zoomMultiplier: number;
      fireRate: number;
      runSpeedMultiplier: number;
      burstCount: number;
      firstBulletAccuracy: number;
    } | null;
    altShotgunStats: null;
    airBurstStats: null;
    damageRanges: Array<{
      rangeStartMeters: number;
      rangeEndMeters: number;
      headDamage: number;
      bodyDamage: number;
      legDamage: number;
    }>;
  } | null;
  shopData: {
    cost: number;
    category: string;
    shopOrderPriority: number;
    categoryText: string;
    gridPosition: { row: number; column: number } | null;
    canBeTrashed: boolean;
    image: string | null;
    newImage: string;
    newImage2: string | null;
    assetPath: string;
  } | null;
  skins: Array<{
    uuid: string;
    displayName: string;
    themeUuid: string;
    contentTierUuid: string | null;
    displayIcon: string | null;
    wallpaper: string | null;
    assetPath: string;
    chromas: Array<{
      uuid: string;
      displayName: string;
      displayIcon: string | null;
      fullRender: string;
      swatch: string | null;
      streamedVideo: string | null;
      assetPath: string;
    }>;
    levels: Array<{
      uuid: string;
      displayName: string;
      levelItem: string | null;
      displayIcon: string | null;
      streamedVideo: string | null;
      assetPath: string;
    }>;
  }>;
}

// ─── API Wrappers ─────────────────────────────────────────────────────────────

export interface HenrikApiResponse<T> {
  status: number;
  data: T;
}

// ─── Enums / Literals ─────────────────────────────────────────────────────────

export type ValorantRegion = 'na' | 'eu' | 'ap' | 'kr' | 'latam' | 'br';

export type ValorantQueue =
  | 'competitive'
  | 'unrated'
  | 'spikerush'
  | 'tournament'
  | 'deathmatch'
  | 'onefa'
  | 'ggteam'
  | 'hurm';
