import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/server-client';
import { NextRequest, NextResponse } from 'next/server';

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

  // ── Look up Stripe customer ───────────────────────────────────────────────
  const { data: subscription, error: dbError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (dbError || !subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No active subscription found for this account' },
      { status: 404 }
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  // ── Create portal session ────────────────────────────────────────────────
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   subscription.stripe_customer_id,
      return_url: `${origin}/settings/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('[Stripe Portal] Failed to create portal session:', err);
    return NextResponse.json(
      { error: 'Failed to open billing portal' },
      { status: 500 }
    );
  }
}
