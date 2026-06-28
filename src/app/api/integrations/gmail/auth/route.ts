import { NextResponse } from 'next/server';
import { getOAuthClient, GMAIL_SCOPES } from '@/lib/gmailClient';

export async function GET() {
  const oauth2 = getOAuthClient();
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    prompt: 'consent',
  });
  return NextResponse.redirect(url);
}
