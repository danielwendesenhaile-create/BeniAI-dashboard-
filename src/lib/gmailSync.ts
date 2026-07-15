import { google } from 'googleapis';
import { getOAuthClient } from './gmailClient';
import { tokenStore } from './tokenStore';
import { classifyAndDelegate } from './agentPipeline';
import { db } from './db';

interface GoogleMessagePayload {
  body?: { data?: string };
  parts?: GoogleMessagePayload[];
  mimeType?: string;
}

function decodeBase64(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function extractBody(payload: GoogleMessagePayload): string {
  if (payload.body?.data) return decodeBase64(payload.body.data);
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64(part.body.data);
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data)
        return decodeBase64(part.body.data).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }
  return '';
}

export async function syncGmailForUser(userId: string) {
  await tokenStore.loadFromDb(userId);
  const tokens = tokenStore.getGmail(userId);
  if (!tokens) throw new Error('Gmail not connected');

  const oauth2 = getOAuthClient();
  oauth2.setCredentials(tokens);

  if (tokens.expiry_date < Date.now()) {
    const { credentials } = await oauth2.refreshAccessToken();
    tokenStore.setGmail(userId, {
      access_token: credentials.access_token!,
      refresh_token: credentials.refresh_token ?? tokens.refresh_token,
      expiry_date: credentials.expiry_date ?? Date.now() + 3600 * 1000,
    });
    oauth2.setCredentials(credentials);
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  const listRes = await gmail.users.messages.list({ userId: 'me', q: 'is:unread in:inbox', maxResults: 10 });
  const messageIds = listRes.data.messages ?? [];

  const items = [];
  for (const { id } of messageIds) {
    if (!id) continue;
    const msg = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
    const headers = msg.data.payload?.headers ?? [];
    const get = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';
    const sender = get('From');
    const subject = get('Subject') || '(no subject)';
    const body = extractBody(msg.data.payload as GoogleMessagePayload);
    const timestamp = new Date(get('Date') || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const item = await classifyAndDelegate({ id: `gmail-${id}`, source: 'gmail', sender, subject, body: body.slice(0, 2000), timestamp });

    await db.priorityItem.upsert({
      where: { id: item.id },
      create: { ...item, userId },
      update: {},
    });

    await db.stats.upsert({
      where: { userId },
      create: { userId, messagesFiltered: 1 },
      update: { messagesFiltered: { increment: 1 } },
    });

    items.push(item);
  }

  return items;
}
