export type LfgProfileEmbed = {
  username: string | null;
  avatar_url: string | null;
  current_rank: number | null;
  riot_puuid: string | null;
  riot_name: string | null;
  riot_tag: string | null;
};

export type LfgPostWithProfile = {
  id: string;
  user_id: string;
  rank: string;
  agents: string[];
  region: string;
  playstyle: string | null;
  description: string | null;
  available_from: string | null;
  available_to: string | null;
  created_at: string;
  expires_at: string;
  profiles: LfgProfileEmbed | LfgProfileEmbed[] | null;
};

export function profileFromPost(post: LfgPostWithProfile): LfgProfileEmbed | null {
  const p = post.profiles;
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}
