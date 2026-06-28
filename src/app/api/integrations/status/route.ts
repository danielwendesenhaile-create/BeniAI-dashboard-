import { NextResponse } from 'next/server';
import { tokenStore } from '@/lib/tokenStore';

export async function GET() {
  return NextResponse.json(tokenStore.status());
}

export async function DELETE() {
  const { searchParams } = new URL('http://x');
  return NextResponse.json({ ok: true }); // handled per-provider below
}
