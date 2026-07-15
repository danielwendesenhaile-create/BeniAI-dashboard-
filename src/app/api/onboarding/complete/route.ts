import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const { userId } = await requireAuth();
    await db.user.update({ where: { id: userId }, data: { onboarded: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
