import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { tokenStore } from '@/lib/tokenStore';
import { z } from 'zod';

const schema = z.object({
  bot_token: z.string().min(1),
  team_id: z.string().default('unknown'),
  team_name: z.string().default('Workspace'),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = schema.parse(await req.json());
    tokenStore.setSlack(userId, body);
    return NextResponse.json({ ok: true, team_name: body.team_name });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'bot_token required' }, { status: 400 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    tokenStore.clearSlack(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
