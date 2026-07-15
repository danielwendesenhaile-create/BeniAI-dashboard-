import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { decrypt } from '@/lib/tokenStore';
import { classifyAndDelegate } from '@/lib/agentPipeline';
import { db } from '@/lib/db';
import { log } from '@/lib/logger';

function verifyWhatsAppSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signature.startsWith('sha256=')) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch { return false; }
}

// Meta webhook verification (GET) — no auth needed, uses verify_token from DB
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  // Try to find an integration matching this verify_token
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge ?? '', { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Incoming messages from Meta (POST) — webhook, no user session
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') ?? '';

  if (!verifyWhatsAppSignature(rawBody, signature)) {
    log.warn('whatsapp.webhook.invalid_signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const entry = body.entry?.[0];
  const value = entry?.changes?.[0]?.value;
  const messages = value?.messages;

  if (!messages?.length) return NextResponse.json({ ok: true });

  // Find which user owns this WhatsApp phone number
  const phoneNumberId = value?.metadata?.phone_number_id as string | undefined;
  let userId: string | null = null;
  if (phoneNumberId) {
    const integrations = await db.integration.findMany({ where: { provider: 'whatsapp' } });
    for (const integration of integrations) {
      try {
        const meta = JSON.parse(integration.metadata);
        if (meta.phone_number_id === phoneNumberId) {
          userId = integration.userId;
          break;
        }
      } catch { /* skip */ }
    }
  }

  for (const msg of messages) {
    if (msg.type !== 'text' || !msg.text?.body) continue;

    const contact = value.contacts?.find((c: { wa_id: string }) => c.wa_id === msg.from);
    const senderName = contact?.profile?.name ?? msg.from;
    const text: string = msg.text.body;
    const timestamp = new Date(parseInt(msg.timestamp) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    classifyAndDelegate({
      id: `wa-${msg.id}`,
      source: 'whatsapp',
      sender: senderName,
      subject: text.slice(0, 80),
      body: text.slice(0, 2000),
      timestamp,
    }).then(async (item) => {
      if (userId) {
        await db.priorityItem.upsert({
          where: { id: item.id },
          create: { ...item, userId },
          update: { ...item },
        });
      }
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
