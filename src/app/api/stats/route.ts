import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const stats = await db.stats.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });

  return NextResponse.json([
    { label: 'Messages Filtered', value: stats.messagesFiltered, unit: 'today' },
    { label: 'Drafts Generated', value: stats.draftsGenerated, unit: 'today' },
    { label: 'Meetings Blocked', value: stats.meetingsBlocked, unit: 'this week' },
    { label: 'Alerts Fired', value: stats.alertsFired, unit: 'today' },
  ]);
}
