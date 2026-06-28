import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();

  const item = await db.priorityItem.update({
    where: { id },
    data: {
      status,
      ...(status === 'approved' ? { sentAt: new Date() } : {}),
    },
  });

  // Update stats counter
  if (status === 'approved') {
    await db.stats.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', draftsGenerated: 1 },
      update: { draftsGenerated: { increment: 1 } },
    });
  }

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.priorityItem.update({ where: { id }, data: { status: 'dismissed' } });
  return NextResponse.json({ ok: true });
}
