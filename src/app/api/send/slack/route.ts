import { NextRequest, NextResponse } from 'next/server';
import { sendSlack } from '@/lib/senders';

export async function POST(req: NextRequest) {
  try {
    const { channel, text, thread_ts } = await req.json();

    if (!channel || !text) {
      return NextResponse.json({ error: 'channel and text are required' }, { status: 400 });
    }

    const result = await sendSlack({ channel, text, thread_ts });
    return NextResponse.json({ ...result, sent: true });
  } catch (err) {
    console.error('[Send Slack]', err);
    const message = err instanceof Error ? err.message : 'Send failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
