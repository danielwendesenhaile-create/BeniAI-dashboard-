import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().max(100).default(''),
  company: z.string().max(100).default(''),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const existing = await db.waitlistEntry.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ message: "You're already on the list — we'll be in touch!" });
    }

    await db.waitlistEntry.create({ data: body });

    return NextResponse.json({ message: "You're on the list! We'll be in touch soon." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}
