"use client";

import {
  BarChart3,
  Crosshair,
  LayoutDashboard,
  Map,
  Swords,
  Users,
} from "lucide-react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "matches", label: "Matches", icon: Swords },
  { id: "agents", label: "Agents", icon: Users },
  { id: "maps", label: "Maps", icon: Map },
  { id: "weapons", label: "Weapons", icon: Crosshair },
  { id: "compare", label: "Compare", icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]["id"];
const TAB_IDS = new Set<string>(TABS.map((t) => t.id));

const SCROLL_SPY_ROOT_MARGIN = "-80px 0px -60% 0px";

/** Sticky offset below global navbar (h-16). */
const STICKY_TOP_CLASS = "top-16";

export function ProfileTabs() {
  const reduced = Boolean(useReducedMotion());
  const [active, setActive] = useState<TabId>("overview");
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const clickScrollRef = useRef(false);
  const ratioRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (raw && TAB_IDS.has(raw)) setActive(raw as TabId);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const r = entry.boundingClientRect;
        setIsStuck(r.bottom <= 0);
      },
      { root: null, threshold: 0, rootMargin: "0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    for (const t of TABS) ratioRef.current[t.id] = 0;

    const obs = new IntersectionObserver(
      (entries) => {
        if (clickScrollRef.current) return;
        for (const e of entries) {
          const id = e.target.id;
          if (!TAB_IDS.has(id)) continue;
          ratioRef.current[id] = e.isIntersecting ? e.intersectionRatio : 0;
        }
        let best = "";
        let bestR = -1;
        for (const t of TABS) {
          const r = ratioRef.current[t.id] ?? 0;
          if (r > bestR) {
            bestR = r;
            best = t.id;
          }
        }
        if (best && bestR > 0) setActive(best as TabId);
      },
      { root: null, rootMargin: SCROLL_SPY_ROOT_MARGIN, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    for (const s of sections) obs.observe(s);
    return () => obs.disconnect();
  }, []);

  const scrollToId = useCallback((id: TabId) => {
    const el = document.getElementById(id);
    if (!el) return;
    clickScrollRef.current = true;
    setActive(id);
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    const path = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState(null, "", path);
    window.setTimeout(() => {
      clickScrollRef.current = false;
    }, 900);
  }, [reduced]);

  return (
    <>
      <div
        ref={sentinelRef}
        className="pointer-events-none h-px w-full shrink-0"
        aria-hidden
      />
      <nav
        className={`sticky z-[45] w-full border-y border-white/[0.06] transition-[background-color,backdrop-filter] duration-200 ${STICKY_TOP_CLASS} h-14 ${
          isStuck ? "bg-[rgba(10,10,12,0.92)] backdrop-blur-xl" : "bg-[#0A0A0C]"
        }`}
        aria-label="Profile sections"
      >
        <LayoutGroup id="profile-tabs-underline">
          <div className="mx-auto flex h-full max-w-screen-2xl items-stretch overflow-x-auto overflow-y-hidden px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToId(tab.id)}
                  className={`relative flex h-full shrink-0 items-center gap-2 px-4 md:px-5 ${
                    isActive
                      ? "bg-white/[0.03] text-white before:pointer-events-none before:absolute before:left-0 before:top-1/2 before:block before:h-3 before:w-[6px] before:-translate-y-1/2 before:bg-accent-red before:content-[''] before:[clip-path:polygon(0_0,100%_50%,0_100%)]"
                      : "text-white/50 hover:bg-white/[0.02] hover:text-white"
                  }`}
                >
                  <Icon className="size-[14px] shrink-0" strokeWidth={1.5} aria-hidden />
                  <span className="font-mono-display text-[12px] font-semibold uppercase tracking-[0.2em]">
                    {tab.label}
                  </span>
                  {isActive ? (
                    <motion.span
                      layoutId="tab-underline"
                      className="pointer-events-none absolute bottom-0 left-4 right-4 z-[1] h-0.5 bg-accent-red md:left-5 md:right-5"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </nav>
    </>
  );
}
