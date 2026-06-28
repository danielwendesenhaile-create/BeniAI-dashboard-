import { NextRequest, NextResponse } from 'next/server';
import { tokenStore } from '@/lib/tokenStore';

// POST { phone_number_id, access_token, verify_token } to register WhatsApp config
export async function POST(req: NextRequest) {
  const { phone_number_id, access_token, verify_token } = await req.json();

  if (!phone_number_id || !access_token || !verify_token) {
    return NextResponse.json({ error: 'phone_number_id, access_token, and verify_token are required' }, { status: 400 });
  }

  tokenStore.setWhatsApp({ phone_number_id, access_token, verify_token });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  tokenStore.clearWhatsApp();
  return NextResponse.json({ ok: true });
}
