import { NextRequest, NextResponse } from 'next/server';

// In production replace with your email service (Resend, SendGrid, etc.)
const waitlist: { email: string; name: string; company: string; ts: string }[] = [];

export async function POST(req: NextRequest) {
  try {
    const { email, name, company } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (waitlist.find((e) => e.email === email)) {
      return NextResponse.json({ message: 'Already on the waitlist!' });
    }
    waitlist.push({ email, name: name ?? '', company: company ?? '', ts: new Date().toISOString() });
    console.log('[Waitlist]', { email, name, company });
    return NextResponse.json({ message: 'You\'re on the list! We\'ll be in touch soon.' });
  } catch {
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}
