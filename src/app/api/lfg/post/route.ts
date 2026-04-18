import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkModeration,
  MAX_ACTIVE_POSTS_PER_USER,
  POST_EXPIRY_HOURS,
} from '@/lib/constants/moderation';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rank = typeof body.rank === 'string' ? body.rank : '';
  const region = typeof body.region === 'string' ? body.region : '';
  const agents = Array.isArray(body.agents) ? (body.agents as string[]) : [];
  const playstyle = typeof body.playstyle === 'string' ? body.playstyle : null;
  const description = typeof body.description === 'string' ? body.description.slice(0, 300) : null;
  const available_from = typeof body.available_from === 'string' ? body.available_from : null;
  const available_to = typeof body.available_to === 'string' ? body.available_to : null;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!rank || !region) {
    return NextResponse.json({ error: 'rank and region are required' }, { status: 400 });
  }
  if (agents.length < 1) {
    return NextResponse.json({ error: 'Pick at least one agent' }, { status: 400 });
  }

  // ── Moderation check ──────────────────────────────────────────────────────
  const checkText = [description, playstyle].filter(Boolean).join(' ');
  const modViolation = checkModeration(checkText);
  if (modViolation) {
    return NextResponse.json({ error: modViolation }, { status: 422 });
  }

  // ── Rate limiting: max N active posts ─────────────────────────────────────
  const expiryWindow = new Date(Date.now() - POST_EXPIRY_HOURS * 3600 * 1000).toISOString();
  const { count, error: countErr } = await supabase
    .from('lfg_posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)
    .gte('created_at', expiryWindow);

  if (countErr) {
    console.error('[lfg/post] count error:', countErr.message);
    return NextResponse.json({ error: 'Failed to check active posts' }, { status: 500 });
  }

  if ((count ?? 0) >= MAX_ACTIVE_POSTS_PER_USER) {
    return NextResponse.json(
      { error: `You have ${MAX_ACTIVE_POSTS_PER_USER} active posts. Delete one before posting again.` },
      { status: 429 }
    );
  }

  // ── Insert ────────────────────────────────────────────────────────────────
  const expires_at = new Date(Date.now() + POST_EXPIRY_HOURS * 3600 * 1000).toISOString();

  const { data, error: insertErr } = await supabase
    .from('lfg_posts')
    .insert({
      user_id: user.id,
      rank,
      agents,
      region,
      playstyle,
      description,
      available_from,
      available_to,
      is_active: true,
      expires_at,
    })
    .select('id')
    .single();

  if (insertErr) {
    console.error('[lfg/post] insert error:', insertErr.message);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
