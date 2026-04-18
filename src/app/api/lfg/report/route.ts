import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AUTO_REMOVE_REPORT_THRESHOLD } from '@/lib/constants/moderation';

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

  const postId = typeof body.post_id === 'string' ? body.post_id : null;
  const reason = typeof body.reason === 'string' ? body.reason.slice(0, 200) : null;

  if (!postId || !reason) {
    return NextResponse.json({ error: 'post_id and reason are required' }, { status: 400 });
  }

  // Prevent reporting own post
  const { data: post } = await supabase
    .from('lfg_posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (post?.user_id === user.id) {
    return NextResponse.json({ error: 'You cannot report your own post' }, { status: 400 });
  }

  // lfg_reports table is added via migration 004 — type cast until types are regenerated
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertErr } = await (supabase as any)
    .from('lfg_reports')
    .insert({ post_id: postId, reporter_id: user.id, reason });

  if (insertErr) {
    // unique_violation = already reported
    if (insertErr.code === '23505') {
      return NextResponse.json({ error: 'You have already reported this post' }, { status: 409 });
    }
    console.error('[lfg/report] insert error:', insertErr.message);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Check total reports — auto-remove if threshold hit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('lfg_reports')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  if ((count ?? 0) >= AUTO_REMOVE_REPORT_THRESHOLD) {
    await supabase
      .from('lfg_posts')
      .update({ is_active: false })
      .eq('id', postId);
    console.log(`[lfg/report] Auto-removed post ${postId} after ${count} reports`);
  }

  return NextResponse.json({ reported: true }, { status: 200 });
}
