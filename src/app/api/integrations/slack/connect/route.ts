import { NextRequest, NextResponse } from 'next/server';
import { tokenStore } from '@/lib/tokenStore';

// Slack uses bot tokens (no OAuth flow needed for single-workspace apps)
// POST with { bot_token, team_id, team_name } to save credentials
export async function POST(req: NextRequest) {
  const { bot_token, team_id, team_name } = await req.json();

  if (!bot_token) {
    return NextResponse.json({ error: 'bot_token is required' }, { status: 400 });
  }

  tokenStore.setSlack({ bot_token, team_id: team_id ?? 'unknown', team_name: team_name ?? 'Workspace' });
  return NextResponse.json({ ok: true, team_name });
}

export async function DELETE() {
  tokenStore.clearSlack();
  return NextResponse.json({ ok: true });
}
