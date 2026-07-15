import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { tokenStore } from '@/lib/tokenStore';
import { syncGmailForUser } from '@/lib/gmailSync';

export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    tokenStore.clearGmail(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const items = await syncGmailForUser(userId);
    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof Error && err.message === 'Gmail not connected') {
      return NextResponse.json({ error: 'Gmail not connected', connected: false }, { status: 401 });
    }
    console.error('[Gmail sync]', err);
    return NextResponse.json({ error: 'Gmail sync failed' }, { status: 500 });
  }
}
