import { NextRequest, NextResponse } from 'next/server';
import { sendGmail } from '@/lib/senders';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, threadId } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'to, subject, and body are required' }, { status: 400 });
    }

    const result = await sendGmail({ to, subject, body, threadId });
    return NextResponse.json({ ...result, sent: true });
  } catch (err) {
    console.error('[Send Gmail]', err);
    const message = err instanceof Error ? err.message : 'Send failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
