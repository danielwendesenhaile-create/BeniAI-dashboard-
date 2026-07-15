import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncGmailForUser } from '@/lib/gmailSync';
import { log } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const integrations = await db.integration.findMany({ where: { provider: 'gmail' } });

  const results = await Promise.allSettled(
    integrations.map((i) => syncGmailForUser(i.userId))
  );

  const summary = results.map((r, idx) => ({
    userId: integrations[idx].userId,
    ok: r.status === 'fulfilled',
    count: r.status === 'fulfilled' ? r.value.length : 0,
    error: r.status === 'rejected' ? String(r.reason) : undefined,
  }));

  const failures = summary.filter((s) => !s.ok);
  if (failures.length > 0) log.warn('cron.sync-gmail.failures', { failures });

  return NextResponse.json({ synced: summary.length, failures: failures.length, summary });
}
