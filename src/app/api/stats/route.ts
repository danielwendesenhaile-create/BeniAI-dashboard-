import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const stats = await db.stats.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return NextResponse.json([
      { label: 'Messages Filtered', value: stats.messagesFiltered, unit: 'today' },
      { label: 'Drafts Generated', value: stats.draftsGenerated, unit: 'today' },
      { label: 'Meetings Blocked', value: stats.meetingsBlocked, unit: 'this week' },
      { label: 'Alerts Fired', value: stats.alertsFired, unit: 'today' },
      { label: 'Hours Saved', value: Math.round(stats.hoursSaved * 10) / 10, unit: 'this week' },
    ]);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
