"use client";

import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import { createClient } from "@/lib/supabase/client";
import { DEMO_LFG_POSTS } from "@/lib/lfg/demo-posts";
import { rankInRange, rankKeyOrdinal } from "@/lib/lfg/ranks";
import type { Agent } from "@/types/valorant";
import type { User } from "@supabase/supabase-js";
import { Plus, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LfgCreateModal } from "./LfgCreateModal";
import type { AgentChip } from "./LfgFilterBar";
import { LfgFilterBar } from "./LfgFilterBar";
import { LfgPostCard } from "./LfgPostCard";
import type { LfgPostWithProfile } from "./types";

const POST_SELECT = `
  id,
  user_id,
  rank,
  agents,
  region,
  playstyle,
  description,
  available_from,
  available_to,
  created_at,
  expires_at,
  profiles!lfg_posts_user_id_fkey (
    username,
    avatar_url,
    current_rank,
    riot_puuid,
    riot_name,
    riot_tag
  )
`;

function buildAgentByName(agents: Agent[]): Map<string, Agent> {
  const m = new Map<string, Agent>();
  for (const a of agents) {
    m.set(a.displayName.trim().toLowerCase(), a);
  }
  return m;
}

export function LfgPageClient({
  agents,
  rankVisuals,
}: {
  agents: Agent[];
  rankVisuals: Record<string, { icon: string; label: string }>;
}) {
  const agentChips: AgentChip[] = useMemo(
    () =>
      agents.map((a) => ({
        uuid: a.uuid,
        displayName: a.displayName,
        displayIcon: a.displayIcon,
      })),
    [agents]
  );

  const agentByName = useMemo(() => buildAgentByName(agents), [agents]);

  const [posts, setPosts] = useState<LfgPostWithProfile[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const [user, setUser] = useState<User | null>(null);
  const [viewerHenrikRank, setViewerHenrikRank] = useState<number | null>(null);
  const [viewerRegion, setViewerRegion] = useState<string | null>(null);

  const [region, setRegion] = useState("");
  const [rankMin, setRankMin] = useState("iron");
  const [rankMax, setRankMax] = useState("radiant");
  const [agentFilter, setAgentFilter] = useState<string[]>([]);
  const [playstyle, setPlaystyle] = useState("any");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (rankKeyOrdinal(rankMin) > rankKeyOrdinal(rankMax)) {
      setRankMax(rankMin);
    }
  }, [rankMin, rankMax]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lfg_posts")
      .select(POST_SELECT)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[lfg] load", error);
      setLoadError(true);
      setPosts(DEMO_LFG_POSTS);
    } else {
      const real = (data ?? []) as LfgPostWithProfile[];
      // Show demo posts when the board is empty so new visitors see example content
      setPosts(real.length > 0 ? real : DEMO_LFG_POSTS);
    }
    setLoading(false);
  }, []);

  const refreshViewer = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u);
    if (!u) {
      setViewerHenrikRank(null);
      setViewerRegion(null);
      return;
    }
    const { data: prof } = await supabase
      .from("profiles")
      .select("current_rank, region")
      .eq("id", u.id)
      .maybeSingle();
    setViewerHenrikRank(typeof prof?.current_rank === "number" ? prof.current_rank : null);
    setViewerRegion(prof?.region ?? null);
  }, []);

  useEffect(() => {
    void loadPosts();
    void refreshViewer();
  }, [loadPosts, refreshViewer]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshViewer();
    });
    return () => subscription.unsubscribe();
  }, [refreshViewer]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("lfg-posts-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lfg_posts" },
        async (payload) => {
          const row = payload.new as { id?: string };
          if (!row?.id) return;
          const { data, error } = await supabase
            .from("lfg_posts")
            .select(POST_SELECT)
            .eq("id", row.id)
            .maybeSingle();
          if (error || !data) return;
          const post = data as LfgPostWithProfile;
          setPosts((prev) => {
            if (prev.some((p) => p.id === post.id)) return prev;
            return [post, ...prev];
          });
          setNewIds((s) => new Set(s).add(post.id));
          setTimeout(() => {
            setNewIds((s) => {
              const n = new Set(s);
              n.delete(post.id);
              return n;
            });
          }, 1200);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (region && p.region !== region) return false;
      if (!rankInRange(p.rank, rankMin, rankMax)) return false;
      if (playstyle !== "any" && (p.playstyle ?? "").toLowerCase() !== playstyle) return false;
      if (agentFilter.length) {
        const pa = p.agents.map((a) => a.toLowerCase());
        const hit = agentFilter.some((f) => pa.includes(f.toLowerCase()));
        if (!hit) return false;
      }
      return true;
    });
  }, [posts, region, rankMin, rankMax, playstyle, agentFilter]);

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <header>
          <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">Find squad</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-text-secondary">
            Match with players in your region and rank — posts refresh live when someone new goes LFG.
          </p>
        </header>
      </div>

      <div className="sticky top-16 z-30">
        <LfgFilterBar
          region={region}
          setRegion={setRegion}
          rankMin={rankMin}
          setRankMin={setRankMin}
          rankMax={rankMax}
          setRankMax={setRankMax}
          agentFilter={agentFilter}
          setAgentFilter={setAgentFilter}
          playstyle={playstyle}
          setPlaystyle={setPlaystyle}
          agents={agentChips}
          onCreateClick={() => setModalOpen(true)}
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border border-white/5 bg-surface"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : null}

        {loadError ? (
          <FetchErrorPanel
            title="Squad board unavailable"
            message="We couldn’t load LFG posts. Check your connection and try again."
            onRetry={loadPosts}
          />
        ) : null}

        {!loading && !loadError && posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-14 text-center">
            <UsersRound className="mx-auto size-12 text-text-secondary" aria-hidden />
            <p className="mt-4 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
              You&apos;re early — no posts yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Be the first to go LFG for your region. Posts show up here instantly for everyone else
              browsing.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-8 inline-flex rounded-full bg-accent-red px-8 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red hover:bg-accent-red/90"
            >
              Create the first post
            </button>
          </div>
        ) : null}

        {!loading && !loadError && posts.length > 0 && filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-surface px-6 py-12 text-center">
            <p className="font-heading text-sm font-semibold text-text-primary">No matches for these filters</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Try widening your rank range, clearing agent picks, or setting region to “any”. You can
              still post — your squad might be exactly what someone else needs.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-6 inline-flex rounded-full bg-accent-red px-6 py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red hover:bg-accent-red/90"
            >
              Create post
            </button>
          </div>
        ) : null}

        {!loading && !loadError && posts.length > 0 && filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((p) => (
              <LfgPostCard
                key={p.id}
                post={p}
                rankVisuals={rankVisuals}
                agentByName={agentByName}
                allAgents={agents}
                viewerHenrikRank={user ? viewerHenrikRank : null}
                filterAgentNames={agentFilter}
                isNew={newIds.has(p.id)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <LfgCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        agents={agentChips}
        user={user}
        viewerHenrikRank={viewerHenrikRank}
        viewerRegion={viewerRegion}
        onPosted={() => {
          void loadPosts();
          void refreshViewer();
        }}
      />

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-accent-red text-white shadow-lg transition hover:brightness-110 sm:hidden"
        aria-label="Create LFG post"
      >
        <Plus className="size-7" />
      </button>
    </div>
  );
}
