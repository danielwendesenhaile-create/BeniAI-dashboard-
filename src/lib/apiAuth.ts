/**
 * Call at the top of every authenticated API route.
 * Returns { userId, session } or throws a 401 NextResponse.
 */
import { auth } from './auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return { userId: session.user.id, session };
}
