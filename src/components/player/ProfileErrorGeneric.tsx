"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ProfileErrorGeneric({ message }: { message: string }) {
  const router = useRouter();
  const reduced = Boolean(useReducedMotion());

  return (
    <motion.main
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.35 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20"
    >
      <h1 className="font-heading text-2xl font-bold text-text-primary">Something went wrong</h1>
      <p className="mt-3 max-w-md text-center text-sm text-text-secondary">{message}</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-8 rounded-full bg-accent-red px-8 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red hover:bg-accent-red/90"
      >
        Retry
      </button>
      <Link
        href="/"
        className="mt-6 text-sm font-semibold text-accent-blue hover:underline"
      >
        Back to home
      </Link>
    </motion.main>
  );
}
