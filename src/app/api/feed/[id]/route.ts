import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const { status, snoozedUntil, delegatedTo } = await req.json();

    // Ensure the item belongs to this user (row-level check)
    const existing = await db.priorityItem.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const item = await db.priorityItem.update({
      where: { id },
      data: {
        status,
        ...(status === 'approved' ? { sentAt: new Date() } : {}),
        ...(snoozedUntil ? { snoozedUntil: new Date(snoozedUntil) } : {}),
        ...(delegatedTo ? { delegatedTo } : {}),
      },
    });

    if (status === 'approved') {
      await db.stats.upsert({
        where: { userId },
        create: { userId, draftsGenerated: 1 },
        update: { draftsGenerated: { increment: 1 } },
      });
    }

    return NextResponse.json(item);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const existing = await db.priorityItem.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.priorityItem.update({ where: { id }, data: { status: 'dismissed' } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
