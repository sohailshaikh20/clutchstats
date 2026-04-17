"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Map,
  Menu,
  Search,
  Sparkles,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { playerPathFromSearchInput } from "@/lib/riot-search";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

const navItems = [
  { href: "/stats", label: "Stats" },
  { href: "/esports", label: "Esports" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/lfg", label: "Find Squad" },
  { href: "/coach", label: "AI Coach" },
] as const;

const tabItems = [
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/esports", label: "Esports", icon: Trophy },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/lfg", label: "Squad", icon: UsersRound },
  { href: "/coach", label: "Coach", icon: Sparkles },
] as const;

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean) {
  return [
    "font-heading text-sm font-semibold uppercase tracking-wide transition-colors",
    active ? "text-accent-red" : "text-text-secondary hover:text-text-primary",
  ].join(" ");
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = Boolean(useReducedMotion());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navSearchQ, setNavSearchQ] = useState("");

  function onNavSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const path = playerPathFromSearchInput(navSearchQ);
    if (path) {
      router.push(path);
      setNavSearchQ("");
    }
  }

  useEffect(() => {
    setDrawerOpen(false);
    setNavSearchQ("");
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <>
      <motion.header
        initial={reduced ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0 font-heading text-xl font-bold">
            <span className="text-accent-red">CLUTCH</span>
            <span className="text-text-primary">STATS</span>
            <span className="text-text-secondary">.gg</span>
          </Link>

          <motion.nav
            className="hidden items-center gap-8 md:flex"
            initial="hidden"
            animate="show"
            variants={
              reduced
                ? { hidden: {}, show: {} }
                : {
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.06, delayChildren: 0.12 },
                    },
                  }
            }
          >
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <motion.div
                  key={item.href}
                  variants={
                    reduced
                      ? {
                          hidden: { opacity: 1, y: 0 },
                          show: { opacity: 1, y: 0 },
                        }
                      : {
                          hidden: { opacity: 0, y: -6 },
                          show: { opacity: 1, y: 0 },
                        }
                  }
                  transition={
                    reduced ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <Link href={item.href} className={navLinkClass(active)}>
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-initial md:gap-3">
            <div className="min-w-0 max-w-[9rem] transition-[max-width] duration-300 ease-out focus-within:max-w-full sm:max-w-none sm:w-36 sm:focus-within:w-52 sm:transition-[width]">
              <form onSubmit={onNavSearchSubmit} className="relative block w-full" role="search">
                <label className="relative block w-full">
                  <span className="sr-only">Search player (Name#TAG)</span>
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={navSearchQ}
                    onChange={(e) => setNavSearchQ(e.target.value)}
                    placeholder="Name#TAG"
                    autoComplete="off"
                    className="h-10 w-full rounded-full border border-transparent bg-surface py-2 pl-10 pr-4 font-body text-sm text-text-primary outline-none ring-0 transition-[border-color,box-shadow] placeholder:text-text-secondary/80 focus:border-accent-red/40 focus:shadow-glow-red"
                  />
                </label>
              </form>
            </div>

            <button
              type="button"
              className="inline-flex size-10 touch-manipulation items-center justify-center rounded-full border border-white/10 bg-surface text-text-primary transition-colors hover:border-accent-red/40 hover:text-accent-red md:hidden"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              <span className="sr-only">
                {drawerOpen ? "Close menu" : "Open menu"}
              </span>
              {drawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              initial={reduced ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduced ? undefined : { x: "100%" }}
              transition={
                reduced ? { duration: 0 } : { type: "spring", damping: 28, stiffness: 320 }
              }
              className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col border-l border-white/10 bg-surface/95 shadow-2xl backdrop-blur-xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
                <span className="font-heading text-lg font-bold text-text-primary">
                  Menu
                </span>
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-text-primary hover:border-accent-red/40 hover:text-accent-red"
                  onClick={() => setDrawerOpen(false)}
                >
                  <X className="size-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-3">
                {navItems.map((item, i) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <motion.div
                      key={item.href}
                      initial={reduced ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={
                        reduced ? { duration: 0 } : { delay: 0.04 * i, duration: 0.25 }
                      }
                    >
                      <Link
                        href={item.href}
                        className={[
                          "block rounded-lg px-3 py-3 font-heading text-base font-semibold uppercase tracking-wide",
                          active
                            ? "bg-surface-light text-accent-red"
                            : "text-text-secondary hover:bg-surface-light/60 hover:text-text-primary",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-background/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  className={[
                    "flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-heading font-semibold uppercase tracking-wide transition-colors",
                    active
                      ? "text-accent-red"
                      : "text-text-secondary hover:text-text-primary",
                  ].join(" ")}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
