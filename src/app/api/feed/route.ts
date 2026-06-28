import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const items = await db.priorityItem.findMany({
    where: { status: 'pending' },
    orderBy: [{ urgencyScore: 'desc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const item = await db.priorityItem.upsert({
    where: { id: data.id },
    create: { ...data, status: 'pending' },
    update: { ...data },
  });
  return NextResponse.json(item);
}
