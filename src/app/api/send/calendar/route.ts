import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { createCalendarEvent, sendGmail } from '@/lib/senders';
import { z } from 'zod';

const schema = z.object({
  summary: z.string().max(200),
  description: z.string().max(2000).optional(),
  startISO: z.string(),
  endISO: z.string(),
  attendeeEmails: z.array(z.string().email()).optional(),
  confirmationEmail: z.object({ to: z.string().email(), body: z.string() }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const params = schema.parse(await req.json());
    const event = await createCalendarEvent(userId, params);
    if (params.confirmationEmail) {
      await sendGmail(userId, {
        to: params.confirmationEmail.to,
        subject: `Meeting confirmed: ${params.summary}`,
        body: params.confirmationEmail.body,
      });
    }
    return NextResponse.json({ ...event, sent: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
