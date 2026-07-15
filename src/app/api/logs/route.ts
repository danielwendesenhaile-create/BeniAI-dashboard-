import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { db } from '@/lib/db';
import { z } from 'zod';

const logSchema = z.object({
  agent: z.string().max(50),
  message: z.string().max(500),
  time: z.string(),
});

export async function GET() {
  try {
    const { userId } = await requireAuth();
    const logs = await db.agentLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ logs });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = logSchema.parse(await req.json());
    const log = await db.agentLog.create({ data: { ...body, userId } });
    return NextResponse.json(log);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
