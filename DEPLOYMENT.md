# BeniAI Deployment Guide

Production checklist for shipping the executive dashboard. Written against the current
stack: Next.js 16 (Turbopack, `proxy.ts` runtime), Prisma 7 + `@prisma/adapter-pg`,
Supabase Postgres, NextAuth v5 (Google OAuth, database sessions).

## 1. Database — Supabase Postgres

Already the chosen datastore (`prisma/schema.prisma` → `provider = "postgresql"`).

1. Create a Supabase project (or reuse the existing one this app already points to).
2. From **Project Settings → Database**, grab two connection strings:
   - `DATABASE_URL` — the **pooled** connection (port `6543`, `?pgbouncer=true`). Used at runtime.
   - `DIRECT_URL` — the **direct** connection (port `5432`). Used by Prisma Migrate, which can't run through the pooler.
3. Apply migrations to production:
   ```bash
   npx prisma migrate deploy
   ```
4. Verify tables exist: `User`, `Account`, `Session`, `VerificationToken`, `PriorityItem`, `AgentLog`, `Integration`, `Stats`, `WaitlistEntry`.

## 2. Environment variables

Set these in Vercel (**Project → Settings → Environment Variables**) for Production
(and Preview if you want staging to work). Reference: `.env.local` has the same keys
with local values.

| Variable | Where it comes from | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase (pooled) | §1 |
| `DIRECT_URL` | Supabase (direct) | §1, migrations only |
| `ENCRYPTION_KEY` | Generate: `openssl rand -hex 32` | Encrypts Gmail/Slack/WhatsApp tokens at rest (AES-256-CBC, see `src/lib/tokenStore.ts`). **Changing this after go-live invalidates every stored integration token** — treat it like a secret you never rotate casually. |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Powers the AI agents (`src/lib/agentPipeline.ts`, draft generation, summarize) |
| `NEXT_PUBLIC_BASE_URL` | Your prod URL, e.g. `https://app.yourdomain.com` | Used for internal server-to-server API calls |
| `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` | Google Cloud Console | §3 |
| `GMAIL_REDIRECT_URI` | `https://app.yourdomain.com/api/integrations/gmail/callback` | Must exactly match an authorized redirect URI in Google Cloud Console |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` | Signs NextAuth session cookies |
| `NEXTAUTH_URL` | `https://app.yourdomain.com` | |
| `SLACK_SIGNING_SECRET` | Slack app → Basic Information | §7 — verifies inbound Slack Events API requests |
| `WHATSAPP_VERIFY_TOKEN` | You choose this string | §8 — must match what you enter in Meta's webhook setup |
| `WHATSAPP_APP_SECRET` | Meta App → Settings → Basic | §8 — verifies inbound webhook HMAC signatures |

## 3. Google OAuth (Gmail login + Gmail/Calendar access)

This is also the app's sign-in provider (`src/lib/auth.ts`), not just a Gmail integration.

1. Google Cloud Console → **APIs & Services → Credentials** → Create OAuth Client ID (Web application).
2. Authorized redirect URIs — add **both**:
   - `https://app.yourdomain.com/api/auth/callback/google` (NextAuth sign-in)
   - `https://app.yourdomain.com/api/integrations/gmail/callback` (Gmail data-access reconnect flow)
3. Enable the **Gmail API** and **Google Calendar API** in the project.
4. Scopes requested (already coded in `auth.ts`): `openid email profile gmail.readonly gmail.send calendar.events`. If your OAuth consent screen is in "Testing" mode, add your own account as a test user or submit for verification before other users can sign in.

## 4. Anthropic API key

Standard key from the Anthropic Console. No special scopes — used server-side only in API routes, never exposed to the client.

## 5. Slack (optional, per-user integration)

Unlike Gmail, Slack is **not** an app-wide OAuth flow — each user pastes their own bot
token into **Settings → Integrations** (`POST /api/integrations/slack/connect`), and it's
encrypted and stored per-user in the `Integration` table.

What you configure once, at the app level:
1. Create a Slack app at api.slack.com/apps.
2. **OAuth & Permissions** → bot token scopes: `channels:history`, `im:history`, `users:read`.
3. **Event Subscriptions** → Request URL: `https://app.yourdomain.com/api/integrations/slack/events`. Slack will hit this immediately to verify (`url_verification` challenge, already handled).
4. **Basic Information → App Credentials → Signing Secret** → set as `SLACK_SIGNING_SECRET`.
5. Each user then installs the app to their own workspace and pastes the resulting bot token into the dashboard UI.

## 6. WhatsApp Business API (optional, per-user integration)

Same per-user pattern as Slack — users paste `phone_number_id` + `access_token` into
**Settings → Integrations** (`POST /api/integrations/whatsapp/connect`).

What you configure once, at the app level:
1. Meta Developer Console → create/select an app with the WhatsApp product.
2. Webhook URL: `https://app.yourdomain.com/api/integrations/whatsapp/webhook`.
3. Verify token: any string you choose — enter it in Meta's webhook config **and** set it as `WHATSAPP_VERIFY_TOKEN`.
4. `App Secret` (Settings → Basic) → set as `WHATSAPP_APP_SECRET` — used to verify the `x-hub-signature-256` HMAC on every inbound message.

## 7. Vercel deployment

1. Push this repo to a GitHub remote (currently local-only — no remote configured).
2. Import the repo in Vercel, root directory = `beni-dashboard/` (the Next.js app lives one level below the top-level `BeniAI/` folder).
3. Add all env vars from §2.
4. Build command: `next build` (default, via `npm run build`). Vercel will run `prisma generate` automatically via the `postinstall` hook if you add one — **currently there is no `postinstall` script**, so add:
   ```json
   "postinstall": "prisma generate"
   ```
   to `package.json` scripts, otherwise a fresh Vercel build may use a stale/missing Prisma client.
5. Deploy. First deploy will fail if `prisma migrate deploy` hasn't been run against the target database yet (§1) — run it locally pointed at prod `DIRECT_URL`, or add it as a Vercel deploy hook.

## 8. Domain setup

1. Vercel → Project → Settings → Domains → add `app.yourdomain.com` (or root domain).
2. Update DNS per Vercel's instructions (CNAME or A record).
3. Update `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL`, `GMAIL_REDIRECT_URI`, and the Google/Slack/WhatsApp webhook URLs above to match the final domain — these are easy to leave pointed at a `*.vercel.app` preview URL by mistake.

## 9. Push notifications — not yet built

The PWA shell exists (`public/manifest.json`, installable app metadata) but there's
**no service worker and no push-subscription code** anywhere in `src/`. Two gaps to close
before this is real:

1. `manifest.json` references `/icon-192.png` and `/icon-512.png` — **neither file exists in `public/`**. Add them or PWA install/Lighthouse will fail.
2. No web-push implementation (no `service-worker.js`, no `Notification`/`PushManager` calls, no VAPID keys). This needs to be built from scratch if it's a launch requirement — it's not a config step, it's a feature.

## 10. Post-deploy checklist

- [ ] `npx prisma migrate deploy` run against production `DIRECT_URL`
- [ ] Add `"postinstall": "prisma generate"` to `package.json`
- [ ] Sign in with Google end-to-end on the prod URL
- [ ] Connect Gmail, confirm `/api/integrations/gmail/sync` pulls real messages
- [ ] Send a test Slack event, confirm it lands in the priority feed
- [ ] Send a test WhatsApp message, confirm the webhook signature check passes
- [ ] Submit the waitlist form on `/landing`, confirm a `WaitlistEntry` row is created
- [ ] Run `npx tsc --noEmit` clean (see open item from prior session — never confirmed)
- [ ] PWA icons added, or manifest icons removed until they exist
