import type { Database } from '@/lib/supabase/types';
import { getStripe } from '@/lib/stripe/server-client';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use the raw service-role client (not the cookie-based server client) because
// webhooks arrive without a browser session — there are no cookies to read.
function getAdminSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts the Supabase user ID from a Stripe object's metadata.
 * Both checkout sessions and subscriptions carry supabase_user_id.
 */
function extractUserId(metadata: Stripe.Metadata | null): string | null {
  return metadata?.supabase_user_id ?? null;
}

/**
 * Maps a Stripe subscription status to the value stored in our DB.
 * We store the Stripe status string verbatim so queries are predictable.
 */
function stripeStatusToDb(status: Stripe.Subscription.Status): string {
  return status; // 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | …
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getAdminSupabase>,
  stripeClient: Stripe
) {
  const userId = extractUserId(session.metadata);
  if (!userId) {
    console.error('[Webhook] checkout.session.completed missing supabase_user_id', session.id);
    return;
  }

  // Retrieve the created subscription for full details
  if (!session.subscription) return;

  const subscription = await stripeClient.subscriptions.retrieve(
    session.subscription as string
  );

  // In Stripe API 2026-03-25.dahlia, current_period_end moved to SubscriptionItem
  const firstItem = subscription.items.data[0];
  const periodEnd = firstItem
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null;

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id:                 userId,
      stripe_customer_id:      session.customer as string,
      stripe_subscription_id:  subscription.id,
      status:                  stripeStatusToDb(subscription.status),
      current_period_end:      periodEnd,
      updated_at:              new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('[Webhook] Failed to upsert subscription on checkout:', error);
    return;
  }

  // Flip the profile to premium
  await supabase
    .from('profiles')
    .update({
      is_premium:    true,
      premium_until: periodEnd,
      updated_at:    new Date().toISOString(),
    })
    .eq('id', userId);

  console.info(`[Webhook] Checkout complete — user ${userId} is now premium until ${periodEnd}`);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getAdminSupabase>
) {
  const userId = extractUserId(subscription.metadata);

  // If metadata is missing, fall back to looking up by stripe_subscription_id
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    resolvedUserId = data?.user_id ?? null;
  }

  if (!resolvedUserId) {
    console.error(
      '[Webhook] customer.subscription.updated — cannot resolve user for subscription',
      subscription.id
    );
    return;
  }

  const firstItem = subscription.items.data[0];
  const periodEnd = firstItem
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null;
  const isActive  = subscription.status === 'active' || subscription.status === 'trialing';

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id:                resolvedUserId,
      stripe_customer_id:     subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status:                 stripeStatusToDb(subscription.status),
      current_period_end:     periodEnd,
      updated_at:             new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('[Webhook] Failed to update subscription record:', error);
    return;
  }

  // Keep profile premium flag in sync
  await supabase
    .from('profiles')
    .update({
      is_premium:    isActive,
      premium_until: isActive ? periodEnd : null,
      updated_at:    new Date().toISOString(),
    })
    .eq('id', resolvedUserId);

  console.info(
    `[Webhook] Subscription updated — user ${resolvedUserId}, status: ${subscription.status}`
  );
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getAdminSupabase>
) {
  const userId = extractUserId(subscription.metadata);

  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    resolvedUserId = data?.user_id ?? null;
  }

  if (!resolvedUserId) {
    console.error(
      '[Webhook] customer.subscription.deleted — cannot resolve user for subscription',
      subscription.id
    );
    return;
  }

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id:                resolvedUserId,
      stripe_customer_id:     subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status:                 'canceled',
      current_period_end:     subscription.items.data[0]
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('[Webhook] Failed to mark subscription as canceled:', error);
    return;
  }

  // Revoke premium access
  await supabase
    .from('profiles')
    .update({
      is_premium:    false,
      premium_until: null,
      updated_at:    new Date().toISOString(),
    })
    .eq('id', resolvedUserId);

  console.info(
    `[Webhook] Subscription canceled — user ${resolvedUserId} access revoked`
  );
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  const body      = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // ── Verify webhook signature ──────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  // ── Dispatch ──────────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          supabase,
          stripe
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;

      default:
        // Acknowledge but ignore unhandled event types
        console.info(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    // Return 500 so Stripe retries the delivery
    console.error(`[Webhook] Error processing ${event.type}:`, err);
    return NextResponse.json(
      { error: 'Internal error processing webhook' },
      { status: 500 }
    );
  }

  // Stripe expects a 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
