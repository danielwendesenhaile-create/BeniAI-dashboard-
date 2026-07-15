import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { sendGmail } from '@/lib/senders';
import { z } from 'zod';

const schema = z.object({
  to: z.string().email(),
  subject: z.string().max(200),
  body: z.string().max(10000),
  threadId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const params = schema.parse(await req.json());
    const result = await sendGmail(userId, params);
    return NextResponse.json({ ...result, sent: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const message = err instanceof Error ? err.message : 'Send failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
