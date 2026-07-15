import { NextResponse } from 'next/server';
import { getOAuthClient, GMAIL_SCOPES } from '@/lib/gmailClient';
import { requireAuth } from '@/lib/apiAuth';

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const oauth2 = getOAuthClient();
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_SCOPES,
      prompt: 'consent',
      state: userId, // passed back in callback to identify user
    });
    return NextResponse.redirect(url);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
