import { google } from 'googleapis';
import { WebClient } from '@slack/web-api';
import { getOAuthClient } from './gmailClient';
import { tokenStore } from './tokenStore';

// ── Gmail ─────────────────────────────────────────────────────────────────────

function buildMimeMessage(to: string, subject: string, body: string): string {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ];
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

export async function sendGmail(
  userId: string,
  params: { to: string; subject: string; body: string; threadId?: string }
): Promise<{ messageId: string }> {
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
  const raw = buildMimeMessage(params.to, params.subject, params.body);

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw,
      ...(params.threadId ? { threadId: params.threadId } : {}),
    },
  });

  return { messageId: res.data.id! };
}

// ── Slack ─────────────────────────────────────────────────────────────────────

export async function sendSlack(
  userId: string,
  params: { channel: string; text: string; thread_ts?: string }
): Promise<{ ts: string }> {
  const tokens = tokenStore.getSlack(userId);
  if (!tokens) throw new Error('Slack not connected');

  const slack = new WebClient(tokens.bot_token);
  const res = await slack.chat.postMessage({
    channel: params.channel,
    text: params.text,
    ...(params.thread_ts ? { thread_ts: params.thread_ts } : {}),
  });

  if (!res.ok) throw new Error(`Slack send failed: ${res.error}`);
  return { ts: res.ts as string };
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export async function sendWhatsApp(
  userId: string,
  params: { to: string; text: string }
): Promise<{ messageId: string }> {
  const config = tokenStore.getWhatsApp(userId);
  if (!config) throw new Error('WhatsApp not connected');

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${config.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'text',
        text: { body: params.text },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`WhatsApp send failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return { messageId: data.messages?.[0]?.id ?? 'unknown' };
}

// ── Google Calendar ───────────────────────────────────────────────────────────

export async function createCalendarEvent(
  userId: string,
  params: { summary: string; description?: string; startISO: string; endISO: string; attendeeEmails?: string[] }
): Promise<{ eventId: string; htmlLink: string }> {
  const tokens = tokenStore.getGmail(userId);
  if (!tokens) throw new Error('Google not connected');

  const oauth2 = getOAuthClient();
  oauth2.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2 });

  const res = await calendar.events.insert({
    calendarId: 'primary',
    sendUpdates: 'all',
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startISO },
      end: { dateTime: params.endISO },
      attendees: params.attendeeEmails?.map((email) => ({ email })) ?? [],
    },
  });

  return { eventId: res.data.id!, htmlLink: res.data.htmlLink! };
}
