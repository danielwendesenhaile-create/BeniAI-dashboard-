import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { tokenStore } from '@/lib/tokenStore';

export async function GET() {
  try {
    const { userId } = await requireAuth();
    await tokenStore.loadFromDb(userId);
    return NextResponse.json(tokenStore.status(userId));
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
