import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const logs = await db.agentLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const { agent, message, time } = await req.json();
  const log = await db.agentLog.create({ data: { agent, message, time } });
  return NextResponse.json(log);
}
