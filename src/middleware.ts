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
});

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)'],
};
