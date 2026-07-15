import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { tokenStore } from '@/lib/tokenStore';
import { z } from 'zod';

const schema = z.object({
  phone_number_id: z.string().min(1),
  access_token: z.string().min(1),
  verify_token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = schema.parse(await req.json());
    tokenStore.setWhatsApp(userId, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    tokenStore.clearWhatsApp(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
