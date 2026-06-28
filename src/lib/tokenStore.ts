/**
 * Token store with in-memory cache (fast reads) backed by SQLite via Prisma.
 * Tokens are AES-256-CBC encrypted before storage.
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// ── Encryption ───────────────────────────────────────────────────────────────

const KEY = Buffer.from(
  (process.env.ENCRYPTION_KEY ?? 'change-this-to-a-32-char-secret!!').padEnd(32).slice(0, 32)
);

function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(data: string): string {
  const [ivHex, encHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const enc = Buffer.from(encHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', KEY, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── In-memory cache ──────────────────────────────────────────────────────────

const g = globalThis as typeof globalThis & {
  _beni_gmail?: GmailTokens | null;
  _beni_slack?: SlackTokens | null;
  _beni_whatsapp?: WhatsAppConfig | null;
};

// ── DB persistence helpers ───────────────────────────────────────────────────

async function dbSet(id: string, accessToken: string, meta: object, refreshToken?: string, expiresAt?: Date) {
  try {
    const { db } = await import('./db');
    await db.integration.upsert({
      where: { id },
      create: { id, accessToken: encrypt(accessToken), refreshToken: refreshToken ? encrypt(refreshToken) : null, metadata: JSON.stringify(meta), expiresAt },
      update: { accessToken: encrypt(accessToken), refreshToken: refreshToken ? encrypt(refreshToken) : null, metadata: JSON.stringify(meta), expiresAt },
    });
  } catch { /* DB not yet available during build */ }
}

async function dbGet(id: string) {
  try {
    const { db } = await import('./db');
    return await db.integration.findUnique({ where: { id } });
  } catch { return null; }
}

async function dbDelete(id: string) {
  try {
    const { db } = await import('./db');
    await db.integration.delete({ where: { id } }).catch(() => {});
  } catch { /* ignore */ }
}

// ── Public API ───────────────────────────────────────────────────────────────

export const tokenStore = {
  // Gmail
  getGmail: (): GmailTokens | null => g._beni_gmail ?? null,
  setGmail: (t: GmailTokens) => {
    g._beni_gmail = t;
    dbSet('gmail', t.access_token, { expiry_date: t.expiry_date }, t.refresh_token, new Date(t.expiry_date)).catch(() => {});
  },
  clearGmail: () => { g._beni_gmail = null; dbDelete('gmail'); },

  // Slack
  getSlack: (): SlackTokens | null => g._beni_slack ?? null,
  setSlack: (t: SlackTokens) => {
    g._beni_slack = t;
    dbSet('slack', t.bot_token, { team_id: t.team_id, team_name: t.team_name }).catch(() => {});
  },
  clearSlack: () => { g._beni_slack = null; dbDelete('slack'); },

  // WhatsApp
  getWhatsApp: (): WhatsAppConfig | null => g._beni_whatsapp ?? null,
  setWhatsApp: (t: WhatsAppConfig) => {
    g._beni_whatsapp = t;
    dbSet('whatsapp', t.access_token, { phone_number_id: t.phone_number_id, verify_token: t.verify_token }).catch(() => {});
  },
  clearWhatsApp: () => { g._beni_whatsapp = null; dbDelete('whatsapp'); },

  // Load from DB on cold start (call once at app boot)
  loadFromDb: async () => {
    const [gmail, slack, wa] = await Promise.all([dbGet('gmail'), dbGet('slack'), dbGet('whatsapp')]);
    if (gmail && !g._beni_gmail) {
      const meta = JSON.parse(gmail.metadata);
      g._beni_gmail = { access_token: decrypt(gmail.accessToken), refresh_token: decrypt(gmail.refreshToken!), expiry_date: meta.expiry_date };
    }
    if (slack && !g._beni_slack) {
      const meta = JSON.parse(slack.metadata);
      g._beni_slack = { bot_token: decrypt(slack.accessToken), team_id: meta.team_id, team_name: meta.team_name };
    }
    if (wa && !g._beni_whatsapp) {
      const meta = JSON.parse(wa.metadata);
      g._beni_whatsapp = { access_token: decrypt(wa.accessToken), phone_number_id: meta.phone_number_id, verify_token: meta.verify_token };
    }
  },

  status: () => ({
    gmail: !!g._beni_gmail,
    slack: !!g._beni_slack,
    whatsapp: !!g._beni_whatsapp,
  }),
};
