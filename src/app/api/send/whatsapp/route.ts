import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/senders';

export async function POST(req: NextRequest) {
  try {
    const { to, text } = await req.json();

    if (!to || !text) {
      return NextResponse.json({ error: 'to and text are required' }, { status: 400 });
    }

    const result = await sendWhatsApp({ to, text });
    return NextResponse.json({ ...result, sent: true });
  } catch (err) {
    console.error('[Send WhatsApp]', err);
    const message = err instanceof Error ? err.message : 'Send failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
