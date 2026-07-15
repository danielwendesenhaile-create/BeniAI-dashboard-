import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { tokenStore } from '@/lib/tokenStore';

const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const { userId } = await requireAuth();
    await tokenStore.loadFromDb(userId);
    const status = tokenStore.status(userId);

    const [gmailItems, slackItems] = await Promise.all([
      status.gmail ? safeFetch(`${base}/api/integrations/gmail/sync`) : Promise.resolve([]),
      status.slack ? safeFetch(`${base}/api/integrations/slack/sync`) : Promise.resolve([]),
    ]);

    const items = [...gmailItems, ...slackItems].sort((a: { urgencyScore: number }, b: { urgencyScore: number }) => b.urgencyScore - a.urgencyScore);

    return NextResponse.json({ items, count: items.length, sources: status });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
