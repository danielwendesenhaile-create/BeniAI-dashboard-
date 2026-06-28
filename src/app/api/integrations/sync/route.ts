import { NextResponse } from 'next/server';
import { tokenStore } from '@/lib/tokenStore';
import { PriorityItem } from '@/data/mockData';

const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

async function safeFetch(url: string): Promise<PriorityItem[]> {
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
  const status = tokenStore.status();

  // Fan out to all connected sources in parallel
  const [gmailItems, slackItems] = await Promise.all([
    status.gmail ? safeFetch(`${base}/api/integrations/gmail/sync`) : Promise.resolve([]),
    status.slack ? safeFetch(`${base}/api/integrations/slack/sync`) : Promise.resolve([]),
    // WhatsApp is push-only (webhook), so no pull here
  ]);

  const items: PriorityItem[] = [...gmailItems, ...slackItems].sort((a, b) => b.urgencyScore - a.urgencyScore);

  return NextResponse.json({
    items,
    count: items.length,
    sources: status,
  });
}
