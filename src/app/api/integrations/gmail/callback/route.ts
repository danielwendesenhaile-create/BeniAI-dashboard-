import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/gmailClient';
import { tokenStore } from '@/lib/tokenStore';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing OAuth code' }, { status: 400 });
  }

  try {
    const oauth2 = getOAuthClient();
    const { tokens } = await oauth2.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.json({ error: 'Incomplete token response' }, { status: 400 });
    }

    tokenStore.setGmail({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date ?? Date.now() + 3600 * 1000,
    });

    return NextResponse.redirect(
      new URL('/integrations?connected=gmail', req.nextUrl.origin)
    );
  } catch (err) {
    console.error('[Gmail callback]', err);
    return NextResponse.json({ error: 'OAuth exchange failed' }, { status: 500 });
  }
}
