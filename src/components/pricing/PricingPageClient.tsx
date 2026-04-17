"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FREE_FEATURES = [
  "Player stats lookup",
  "Match history",
  "Esports coverage",
  "Career roadmaps",
  "Basic LFG",
  "Community access",
];

const PRO_FEATURES = [
  "Everything in Free",
  "AI match coaching",
  "Personalised improvement plans",
  "Advanced analytics & trends",
  "Premium LFG (rank-verified, compatibility scores)",
  "Ad-free experience",
  "Priority support",
];

const FAQS = [
  {
    q: "What does the 7-day free trial include?",
    a: "Full Pro access — AI coaching, premium LFG signals, and advanced analytics. You will not be charged until the trial ends. Cancel anytime during the trial from your billing portal.",
  },
  {
    q: "How does billing work after the trial?",
    a: "Your card is authorised at checkout; the first charge happens when the trial ends unless you cancel first. Invoices and receipts are available from Stripe.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account billing settings or the Stripe customer portal. You keep Pro access until the end of the paid period.",
  },
  {
    q: "Do yearly and monthly plans both have a trial?",
    a: "The 7-day trial applies to new subscriptions. If you switch plans later, Stripe handles proration according to your subscription rules.",
  },
  {
    q: "What payment methods are supported?",
    a: "Whatever your region supports through Stripe checkout — major cards, wallets where enabled, and more.",
  },
];

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/valorant";

export function PricingPageClient() {
  const router = useRouter();
  const [billing, setBilling] = useState<"month" | "year">("month");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);

  const startTrial = async () => {
    setCheckoutBusy(true);
    setCheckoutErr(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: billing }),
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/pricing")}`);
        return;
      }
      if (!res.ok) {
        setCheckoutErr(j.error ?? "Checkout failed");
        return;
      }
      if (j.url) window.location.href = j.url;
    } finally {
      setCheckoutBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-red">
          Pricing
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-text-primary md:text-5xl">
          Simple plans for grinders
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
          Start free, upgrade when you want AI coaching and premium squad tools.
        </p>
      </header>

      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-white/10 bg-surface p-1">
          <button
            type="button"
            onClick={() => setBilling("month")}
            className={`rounded-full px-5 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition ${
              billing === "month"
                ? "bg-accent-red text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("year")}
            className={`rounded-full px-5 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition ${
              billing === "year"
                ? "bg-accent-red text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Yearly
            <span
              className={`ml-1.5 text-[10px] font-bold ${
                billing === "year" ? "text-accent-gold" : "text-text-secondary"
              }`}
            >
              Save 29%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
        {/* Free */}
        <article className="flex flex-col rounded-xl border border-surface-light bg-surface p-6 sm:p-8">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">
            Free
          </p>
          <p className="mt-2 font-heading text-3xl font-bold text-text-primary md:text-4xl">EUR 0</p>
          <p className="mt-1 text-sm text-text-secondary">Forever free</p>
          <ul className="mt-8 flex-1 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-3 text-sm text-text-primary">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-blue/15 text-accent-blue">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-8 block w-full rounded-full border-2 border-surface-light bg-transparent py-3 text-center font-heading text-sm font-bold uppercase tracking-wide text-text-primary transition hover:border-accent-blue hover:text-accent-blue"
          >
            Get started
          </Link>
        </article>

        {/* Pro */}
        <article className="relative flex flex-col rounded-xl border-2 border-accent-red bg-surface p-6 shadow-glow-red sm:p-8">
          <span className="absolute -top-3 left-6 rounded-full bg-accent-red px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-white">
            Pro
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-accent-gold/50 bg-accent-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-gold">
              7-day free trial
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={billing}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-4"
            >
              {billing === "month" ? (
                <>
                  <p className="font-heading text-4xl font-bold text-text-primary md:text-5xl">
                    EUR 6.99
                    <span className="text-xl font-semibold text-text-secondary md:text-2xl">/mo</span>
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">Billed monthly after trial</p>
                </>
              ) : (
                <>
                  <p className="font-heading text-4xl font-bold text-text-primary md:text-5xl">
                    EUR 59.99
                    <span className="text-xl font-semibold text-text-secondary md:text-2xl">/year</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-accent-gold">Save ~29% vs monthly</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <ul className="mt-8 flex-1 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex gap-3 text-sm text-text-primary">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-red/15 text-accent-red">
                  <Check className="size-3.5 stroke-[3]" aria-hidden />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={checkoutBusy}
            onClick={() => void startTrial()}
            className="mt-8 w-full rounded-full bg-accent-red py-3.5 font-heading text-base font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:bg-accent-red/90 disabled:opacity-50"
          >
            {checkoutBusy ? "Redirecting…" : "Start free trial"}
          </button>
          {checkoutErr ? <p className="mt-2 text-center text-xs text-loss">{checkoutErr}</p> : null}
          <p className="mt-3 text-center text-xs text-text-secondary">
            Sign in required. Secure checkout via Stripe.
          </p>
        </article>
      </div>

      <section className="mt-20 border-t border-white/10 pt-12">
        <h2 className="text-center font-heading text-2xl font-bold text-text-primary">FAQ</h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-2">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-white/10 bg-surface px-4 py-1 open:bg-surface-light"
            >
              <summary className="cursor-pointer list-none py-3 font-heading text-sm font-semibold text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  {item.q}
                  <ChevronDown
                    className="size-4 shrink-0 text-accent-red transition-transform group-open:-rotate-180"
                    aria-hidden
                  />
                </span>
              </summary>
              <p className="border-t border-white/5 pb-3 pt-1 text-sm leading-relaxed text-text-secondary">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-14 text-center text-sm text-text-secondary">
        Questions?{" "}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-blue underline-offset-4 hover:underline"
        >
          Join our Discord
        </a>
      </p>
    </div>
  );
}
