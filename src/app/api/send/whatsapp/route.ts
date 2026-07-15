import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { sendWhatsApp } from '@/lib/senders';
import { z } from 'zod';

const schema = z.object({ to: z.string().min(1), text: z.string().max(4096) });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const params = schema.parse(await req.json());
    const result = await sendWhatsApp(userId, params);
    return NextResponse.json({ ...result, sent: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 500 });
  }
}
