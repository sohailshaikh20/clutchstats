import Stripe from "stripe";

const API_VERSION = "2026-03-25.dahlia" as const;

let cached: Stripe | null = null;

/** Lazy Stripe client so route modules can load during `next build` without env keys. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached ??= new Stripe(key, { apiVersion: API_VERSION, typescript: true });
  return cached;
}
