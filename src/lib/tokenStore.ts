/**
 * Token store: AES-256-CBC encrypted tokens in Supabase (via Prisma).
 * Per-user: every read/write requires a userId.
 * In-memory cache keyed by userId for fast repeated reads.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// ── Encryption ────────────────────────────────────────────────────────────────

const KEY = Buffer.from(
  (process.env.ENCRYPTION_KEY ?? '').padEnd(32, '0').slice(0, 32)
);

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(data: string): string {
  const [ivHex, encHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const enc = Buffer.from(encHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', KEY, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GmailTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

export interface SlackTokens {
  bot_token: string;
  team_id: string;
  team_name: string;
}

export interface WhatsAppConfig {
  phone_number_id: string;
  access_token: string;
  verify_token: string;
}

// ── In-memory cache ───────────────────────────────────────────────────────────

type Cache = {
  gmail?: GmailTokens | null;
  slack?: SlackTokens | null;
  whatsapp?: WhatsAppConfig | null;
};

const cache = new Map<string, Cache>();

function getCache(userId: string): Cache {
  if (!cache.has(userId)) cache.set(userId, {});
  return cache.get(userId)!;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function dbSet(
  userId: string,
  provider: string,
  accessToken: string,
  meta: object,
  refreshToken?: string,
  expiresAt?: Date
) {
  const { db } = await import('./db');
  await db.integration.upsert({
    where: { userId_provider: { userId, provider } },
    create: {
      userId,
      provider,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : null,
      metadata: JSON.stringify(meta),
      expiresAt,
    },
    update: {
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : null,
      metadata: JSON.stringify(meta),
      expiresAt,
    },
  });
}

async function dbGet(userId: string, provider: string) {
  try {
    const { db } = await import('./db');
    return await db.integration.findUnique({
      where: { userId_provider: { userId, provider } },
    });
  } catch {
    return null;
  }
}

async function dbDelete(userId: string, provider: string) {
  try {
    const { db } = await import('./db');
    await db.integration
      .delete({ where: { userId_provider: { userId, provider } } })
      .catch(() => {});
  } catch { /* ignore */ }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const tokenStore = {
  // Gmail
  getGmail: (userId: string): GmailTokens | null =>
    getCache(userId).gmail ?? null,

  setGmail: (userId: string, t: GmailTokens) => {
    getCache(userId).gmail = t;
    dbSet(userId, 'gmail', t.access_token, { expiry_date: t.expiry_date }, t.refresh_token, new Date(t.expiry_date)).catch(() => {});
  },

  clearGmail: (userId: string) => {
    getCache(userId).gmail = null;
    dbDelete(userId, 'gmail');
  },

  // Slack
  getSlack: (userId: string): SlackTokens | null =>
    getCache(userId).slack ?? null,

  setSlack: (userId: string, t: SlackTokens) => {
    getCache(userId).slack = t;
    dbSet(userId, 'slack', t.bot_token, { team_id: t.team_id, team_name: t.team_name }).catch(() => {});
  },

  clearSlack: (userId: string) => {
    getCache(userId).slack = null;
    dbDelete(userId, 'slack');
  },

  // WhatsApp
  getWhatsApp: (userId: string): WhatsAppConfig | null =>
    getCache(userId).whatsapp ?? null,

  setWhatsApp: (userId: string, t: WhatsAppConfig) => {
    getCache(userId).whatsapp = t;
    dbSet(userId, 'whatsapp', t.access_token, { phone_number_id: t.phone_number_id, verify_token: t.verify_token }).catch(() => {});
  },

  clearWhatsApp: (userId: string) => {
    getCache(userId).whatsapp = null;
    dbDelete(userId, 'whatsapp');
  },

  // Load all tokens from DB into memory (call on first request per user)
  loadFromDb: async (userId: string) => {
    const c = getCache(userId);
    const [gmail, slack, wa] = await Promise.all([
      dbGet(userId, 'gmail'),
      dbGet(userId, 'slack'),
      dbGet(userId, 'whatsapp'),
    ]);
    if (gmail && !c.gmail) {
      const meta = JSON.parse(gmail.metadata);
      c.gmail = {
        access_token: decrypt(gmail.accessToken),
        refresh_token: gmail.refreshToken ? decrypt(gmail.refreshToken) : '',
        expiry_date: meta.expiry_date,
      };
    }
    if (slack && !c.slack) {
      const meta = JSON.parse(slack.metadata);
      c.slack = { bot_token: decrypt(slack.accessToken), team_id: meta.team_id, team_name: meta.team_name };
    }
    if (wa && !c.whatsapp) {
      const meta = JSON.parse(wa.metadata);
      c.whatsapp = { access_token: decrypt(wa.accessToken), phone_number_id: meta.phone_number_id, verify_token: meta.verify_token };
    }
  },

  status: (userId: string) => {
    const c = getCache(userId);
    return { gmail: !!c.gmail, slack: !!c.slack, whatsapp: !!c.whatsapp };
  },
};
