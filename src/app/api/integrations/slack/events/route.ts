import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { classifyAndDelegate } from '@/lib/agentPipeline';
import { log } from '@/lib/logger';

function verifySlackSignature(rawBody: string, timestamp: string, signature: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;
  const base = `v0:${timestamp}:${rawBody}`;
  const expected = 'v0=' + createHmac('sha256', signingSecret).update(base).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const timestamp = req.headers.get('x-slack-request-timestamp') ?? '';
  const signature = req.headers.get('x-slack-signature') ?? '';

  // Replay attack prevention: reject requests older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) {
    return NextResponse.json({ error: 'Request too old' }, { status: 401 });
  }

  if (!verifySlackSignature(rawBody, timestamp, signature)) {
    log.warn('slack.events.invalid_signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  // URL verification handshake
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Handle incoming message events
  if (body.event?.type === 'message' && !body.event.bot_id) {
    const { user, text, channel, ts } = body.event;
    if (text) {
      const timestamp = new Date(parseFloat(ts) * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      classifyAndDelegate({
        id: `slack-event-${ts}`,
        source: 'slack',
        sender: `${user} · #${channel}`,
        subject: text.slice(0, 80),
        body: text.slice(0, 2000),
        timestamp,
        channelId: channel,
      }).catch((err) => log.error('slack.events.classify_failed', err));
    }
  }

  return NextResponse.json({ ok: true });
}
