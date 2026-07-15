import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const items = await db.priorityItem.findMany({
      where: { userId, status: 'pending' },
      orderBy: [{ urgencyScore: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const data = await req.json();
    const item = await db.priorityItem.upsert({
      where: { id: data.id ?? '' },
      create: { ...data, userId, status: 'pending' },
      update: { ...data },
    });
    return NextResponse.json(item);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
