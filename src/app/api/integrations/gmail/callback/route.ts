import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/gmailClient';
import { tokenStore } from '@/lib/tokenStore';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const userId = req.nextUrl.searchParams.get('state'); // set in /auth route
  const googleError = req.nextUrl.searchParams.get('error');

  if (googleError) {
    console.error('[Gmail callback] Google returned an error:', googleError);
    return NextResponse.redirect(
      new URL(`/integrations?error=${encodeURIComponent(googleError)}`, req.nextUrl.origin)
    );
  }

  if (!code || !userId) {
    console.error('[Gmail callback] Missing code or state', { hasCode: !!code, hasUserId: !!userId });
    return NextResponse.redirect(new URL('/integrations?error=missing_code', req.nextUrl.origin));
  }

  try {
    const oauth2 = getOAuthClient();
    const { tokens } = await oauth2.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('[Gmail callback] Incomplete token response', tokens);
      return NextResponse.redirect(new URL('/integrations?error=incomplete_token', req.nextUrl.origin));
    }

    tokenStore.setGmail(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date ?? Date.now() + 3600 * 1000,
    });

    return NextResponse.redirect(new URL('/integrations?connected=gmail', req.nextUrl.origin));
  } catch (err) {
    console.error('[Gmail callback]', err);
    return NextResponse.redirect(new URL('/integrations?error=exchange_failed', req.nextUrl.origin));
  }
}
