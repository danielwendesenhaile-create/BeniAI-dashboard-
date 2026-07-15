import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  // Allow unauthenticated access to webhooks (external services push here)
  const webhookPaths = [
    '/api/integrations/whatsapp/webhook',
    '/api/integrations/slack/events',
  ];
  if (webhookPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    return;
  }

  const { pathname } = req.nextUrl;
  const isOnboarding = pathname.startsWith('/onboarding');
  const isApi = pathname.startsWith('/api');

  // API routes handle their own 401s via requireAuth() — don't redirect those.
  if (isApi) return;

  if (!req.auth?.user) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }

  if (!req.auth.user.onboarded && !isOnboarding) {
    return NextResponse.redirect(new URL('/onboarding', req.nextUrl.origin));
  }
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|landing|login).*)'],
};
