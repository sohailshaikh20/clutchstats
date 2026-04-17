/**
 * Auto-generated Supabase database types.
 * Re-run `supabase gen types typescript --local > src/lib/supabase/types.ts`
 * after each migration to keep this in sync.
 *
 * The manual definitions below match the schema in 001_initial.sql exactly.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          riot_name: string | null;
          riot_tag: string | null;
          riot_puuid: string | null;
          region: string | null;
          current_rank: number | null;
          avatar_url: string | null;
          is_premium: boolean;
          premium_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          riot_name?: string | null;
          riot_tag?: string | null;
          riot_puuid?: string | null;
          region?: string | null;
          current_rank?: number | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          riot_name?: string | null;
          riot_tag?: string | null;
          riot_puuid?: string | null;
          region?: string | null;
          current_rank?: number | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          premium_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      lfg_posts: {
        Row: {
          id: string;
          user_id: string;
          rank: string;
          agents: string[];
          region: string;
          playstyle: string | null;
          description: string | null;
          available_from: string | null;
          available_to: string | null;
          is_active: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rank: string;
          agents?: string[];
          region: string;
          playstyle?: string | null;
          description?: string | null;
          available_from?: string | null;
          available_to?: string | null;
          is_active?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rank?: string;
          agents?: string[];
          region?: string;
          playstyle?: string | null;
          description?: string | null;
          available_from?: string | null;
          available_to?: string | null;
          is_active?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lfg_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      player_cache: {
        Row: {
          puuid: string;
          riot_name: string;
          riot_tag: string;
          region: string;
          rank_data: Json | null;
          match_history: Json | null;
          agent_stats: Json | null;
          cached_at: string;
        };
        Insert: {
          puuid: string;
          riot_name: string;
          riot_tag: string;
          region: string;
          rank_data?: Json | null;
          match_history?: Json | null;
          agent_stats?: Json | null;
          cached_at?: string;
        };
        Update: {
          puuid?: string;
          riot_name?: string;
          riot_tag?: string;
          region?: string;
          rank_data?: Json | null;
          match_history?: Json | null;
          agent_stats?: Json | null;
          cached_at?: string;
        };
        Relationships: [];
      };
      coaching_sessions: {
        Row: {
          id: string;
          user_id: string;
          analysis: Json;
          matches_analysed: number;
          insights_summary: string | null;
          stats_snapshot: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          analysis: Json;
          matches_analysed?: number;
          insights_summary?: string | null;
          stats_snapshot?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          analysis?: Json;
          matches_analysed?: number;
          insights_summary?: string | null;
          stats_snapshot?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'coaching_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      coaching_weekly_goal_progress: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          goal_index: number;
          goal_text: string;
          done: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          goal_index: number;
          goal_text: string;
          done?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          goal_index?: number;
          goal_text?: string;
          done?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'coaching_weekly_goal_progress_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'coaching_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'coaching_weekly_goal_progress_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      valorant_region: 'na' | 'eu' | 'ap' | 'kr' | 'latam' | 'br';
    };
    CompositeTypes: Record<string, never>;
  };
}

// ─── Convenience Row Types ────────────────────────────────────────────────────

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type LFGPostRow = Database['public']['Tables']['lfg_posts']['Row'];
export type PlayerCacheRow = Database['public']['Tables']['player_cache']['Row'];
export type CoachingSessionRow = Database['public']['Tables']['coaching_sessions']['Row'];
export type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];
