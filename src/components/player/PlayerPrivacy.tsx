"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const RIOT_PRIVACY = "https://account.riotgames.com/";

export function PlayerPrivacy() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20"
    >
      <h1 className="text-center font-heading text-3xl font-bold text-text-primary">
        Profile hidden
      </h1>
      <p className="mt-4 max-w-lg text-center text-sm leading-relaxed text-text-secondary">
        This player has disabled third-party access to their match history in
        Riot&apos;s privacy settings. Stats and matches cannot be shown until
        they allow game data for external apps.
      </p>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={RIOT_PRIVACY}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-11 items-center rounded-lg border border-accent-blue/40 bg-surface px-5 font-heading text-xs font-bold uppercase tracking-wide text-accent-blue transition-colors hover:bg-surface-light"
        >
          Open Riot privacy settings
        </Link>
      </motion.div>
      <Link
        href="/"
        className="mt-6 text-sm text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
      >
        ← Back home
      </Link>
    </motion.main>
  );
}
