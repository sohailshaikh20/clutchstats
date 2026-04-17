import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/server-client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CheckoutBodySchema = z.object({
  interval: z.enum(['month', 'year']).optional(),
});

// ClutchStats Premium — €6.99/month (or yearly via STRIPE_PRICE_ID_YEARLY) with a 7-day free trial.
const PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID;
const PRICE_ID_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY;

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let interval: 'month' | 'year' = 'month';
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = CheckoutBodySchema.safeParse(json);
    if (parsed.success && parsed.data.interval) {
      interval = parsed.data.interval;
    }
  } catch {
    /* empty body */
  }

  // ── Resolve price ─────────────────────────────────────────────────────────
  let priceId =
    interval === 'year' && PRICE_ID_YEARLY ? PRICE_ID_YEARLY : PRICE_ID_MONTHLY;

  if (!priceId) {
    // Dev convenience: create a one-off price if none is configured.
    const unit = interval === 'year' ? 5999 : 699; // €59.99 / €6.99
    const price = await stripe.prices.create({
      currency: 'eur',
      unit_amount: unit,
      recurring: { interval: interval === 'year' ? 'year' : 'month' },
      product_data: { name: 'ClutchStats Premium' },
    });
    priceId = price.id;
  }

  // ── Resolve or create Stripe customer ────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let customerId = subscription?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  profile?.username ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    // Persist customer ID immediately so the webhook can look it up
    await supabase.from('subscriptions').upsert(
      {
        user_id:            user.id,
        stripe_customer_id: customerId,
        status:             'incomplete',
      },
      { onConflict: 'user_id' }
    );
  }

  // ── Resolve return URLs ───────────────────────────────────────────────────
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  // ── Create checkout session ───────────────────────────────────────────────
  try {
    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { supabase_user_id: user.id },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing?checkout=cancelled`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Checkout] Failed to create session:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
