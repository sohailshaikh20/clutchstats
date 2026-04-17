import { ValorantRegion } from './valorant';

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'pro' | 'elite';
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete';

export interface SubscriptionLimits {
  coaching_sessions_per_month: number; // -1 = unlimited
  matches_history_days: number;
  lfg_posts_active: number;
  ai_analysis_per_day: number; // -1 = unlimited
  has_pro_features: boolean;
  has_elite_features: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    coaching_sessions_per_month: 3,
    matches_history_days: 7,
    lfg_posts_active: 1,
    ai_analysis_per_day: 2,
    has_pro_features: false,
    has_elite_features: false,
  },
  pro: {
    coaching_sessions_per_month: 20,
    matches_history_days: 90,
    lfg_posts_active: 3,
    ai_analysis_per_day: 10,
    has_pro_features: true,
    has_elite_features: false,
  },
  elite: {
    coaching_sessions_per_month: -1,
    matches_history_days: 365,
    lfg_posts_active: 10,
    ai_analysis_per_day: -1,
    has_pro_features: true,
    has_elite_features: true,
  },
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  notifications_enabled: boolean;
  public_profile: boolean;
  show_rank: boolean;
  favorite_agents: string[];
  default_region: ValorantRegion | null;
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  avatar_url: string | null;
  riot_id: string | null; // "name#tag"
  riot_puuid: string | null;
  region: ValorantRegion | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  onboarding_completed: boolean;
  preferences: UserPreferences;
}

// ─── LFG ─────────────────────────────────────────────────────────────────────

export type LFGRole = 'duelist' | 'initiator' | 'controller' | 'sentinel' | 'flex';

export type LFGRank =
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'ascendant'
  | 'immortal'
  | 'radiant';

export interface LFGPost {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  author: Pick<Profile, 'username' | 'avatar_url' | 'riot_id' | 'region'>;
  region: ValorantRegion;
  rank: LFGRank;
  rank_tier: number;
  roles_wanted: LFGRole[];
  own_role: LFGRole;
  description: string;
  mic_required: boolean;
  language: string;
  discord_tag: string | null;
  expires_at: string;
  is_active: boolean;
  looking_for_count: number;
  party_size_current: number;
  party_size_max: number;
  agents_preferred: string[];
  playstyle_tags: string[];
  view_count: number;
}

export interface LFGPostCreate {
  region: ValorantRegion;
  rank: LFGRank;
  rank_tier: number;
  roles_wanted: LFGRole[];
  own_role: LFGRole;
  description: string;
  mic_required: boolean;
  language: string;
  discord_tag?: string;
  party_size_max: number;
  agents_preferred?: string[];
  playstyle_tags?: string[];
}

// ─── Coaching ─────────────────────────────────────────────────────────────────

export type CoachingSessionStatus = 'pending' | 'active' | 'completed' | 'failed';

export type CoachingFocus =
  | 'aim'
  | 'positioning'
  | 'economy'
  | 'utility'
  | 'communication'
  | 'mental'
  | 'agent_specific'
  | 'general';

export interface CoachingMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CoachingSession {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: CoachingSessionStatus;
  focus: CoachingFocus;
  match_id: string | null;
  agent_played: string | null;
  messages: CoachingMessage[];
  summary: string | null;
  tokens_used: number;
  model: string;
  feedback_rating: 1 | 2 | 3 | 4 | 5 | null;
}

// ─── Stripe Subscription ─────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}
