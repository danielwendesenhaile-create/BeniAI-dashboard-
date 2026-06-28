import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuthClient } from '@/lib/gmailClient';
import { tokenStore } from '@/lib/tokenStore';
import { classifyAndDelegate } from '@/lib/agentPipeline';
import { PriorityItem } from '@/data/mockData';

function decodeBase64(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractBody(payload: GoogleMessagePayload): string {
  if (payload.body?.data) return decodeBase64(payload.body.data);
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return decodeBase64(part.body.data).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  }
  return '';
}

interface GoogleMessagePayload {
  body?: { data?: string };
  parts?: GoogleMessagePayload[];
  mimeType?: string;
}

export async function GET() {
  const tokens = tokenStore.getGmail();
  if (!tokens) {
    return NextResponse.json({ error: 'Gmail not connected', connected: false }, { status: 401 });
  }

  try {
    const oauth2 = getOAuthClient();
    oauth2.setCredentials(tokens);

    // Auto-refresh expired tokens
    if (tokens.expiry_date < Date.now()) {
      const { credentials } = await oauth2.refreshAccessToken();
      tokenStore.setGmail({
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token ?? tokens.refresh_token,
        expiry_date: credentials.expiry_date ?? Date.now() + 3600 * 1000,
      });
      oauth2.setCredentials(credentials);
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    // Fetch last 10 unread messages
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread in:inbox',
      maxResults: 10,
    });

    const messageIds = listRes.data.messages ?? [];
    if (messageIds.length === 0) {
      return NextResponse.json({ items: [], count: 0 });
    }

    const items: PriorityItem[] = [];

    for (const { id } of messageIds) {
      if (!id) continue;

      const msg = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
      const headers = msg.data.payload?.headers ?? [];
      const get = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';

      const sender = get('From');
      const subject = get('Subject') || '(no subject)';
      const body = extractBody(msg.data.payload as GoogleMessagePayload);
      const dateStr = get('Date');
      const timestamp = dateStr ? new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'unknown';

      const item = await classifyAndDelegate({
        id: `gmail-${id}`,
        source: 'gmail',
        sender,
        subject,
        body: body.slice(0, 2000),
        timestamp,
      });

      items.push(item);
    }

    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    console.error('[Gmail sync]', err);
    return NextResponse.json({ error: 'Gmail sync failed' }, { status: 500 });
  }
}
