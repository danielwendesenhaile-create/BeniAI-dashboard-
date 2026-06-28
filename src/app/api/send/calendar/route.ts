import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent, sendGmail } from '@/lib/senders';

export async function POST(req: NextRequest) {
  try {
    const { summary, description, startISO, endISO, attendeeEmails, confirmationEmail } = await req.json();

    if (!summary || !startISO || !endISO) {
      return NextResponse.json({ error: 'summary, startISO, and endISO are required' }, { status: 400 });
    }

    const event = await createCalendarEvent({ summary, description, startISO, endISO, attendeeEmails });

    // Optionally send a confirmation email
    if (confirmationEmail?.to && confirmationEmail?.body) {
      await sendGmail({
        to: confirmationEmail.to,
        subject: `Meeting confirmed: ${summary}`,
        body: confirmationEmail.body,
      });
    }

    return NextResponse.json({ ...event, sent: true });
  } catch (err) {
    console.error('[Send Calendar]', err);
    const message = err instanceof Error ? err.message : 'Calendar event creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
