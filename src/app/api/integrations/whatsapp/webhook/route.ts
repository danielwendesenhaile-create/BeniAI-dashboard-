import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { tokenStore } from '@/lib/tokenStore';
import { classifyAndDelegate } from '@/lib/agentPipeline';
import { log } from '@/lib/logger';

function verifyWhatsAppSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signature.startsWith('sha256=')) return false;
  const expected = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch { return false; }
}

// Meta webhook verification (GET)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  const config = tokenStore.getWhatsApp();
  const verifyToken = config?.verify_token ?? process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge ?? '', { status: 200 });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Incoming messages (POST)
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') ?? '';

  if (!verifyWhatsAppSignature(rawBody, signature)) {
    log.warn('whatsapp.webhook.invalid_signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  // Parse Meta Cloud API payload
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;

  if (!messages || messages.length === 0) {
    return NextResponse.json({ ok: true }); // status ping or delivery receipt
  }

  const config = tokenStore.getWhatsApp();

  for (const msg of messages) {
    if (msg.type !== 'text' || !msg.text?.body) continue;

    const contact = value.contacts?.find((c: { wa_id: string }) => c.wa_id === msg.from);
    const senderName = contact?.profile?.name ?? msg.from;
    const text: string = msg.text.body;
    const timestamp = new Date(parseInt(msg.timestamp) * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Classify in background — acknowledge Meta immediately
    classifyAndDelegate({
      id: `wa-${msg.id}`,
      source: 'whatsapp',
      sender: senderName,
      subject: text.slice(0, 80),
      body: text.slice(0, 2000),
      timestamp,
    }).then(async (item) => {
      // Optionally auto-send the draft back via WhatsApp Business API
      if (item.category === 'Informational' && config) {
        await sendWhatsAppMessage(config.phone_number_id, config.access_token, msg.from, item.draftReply);
      }
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}

async function sendWhatsAppMessage(phoneNumberId: string, accessToken: string, to: string, text: string) {
  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}
