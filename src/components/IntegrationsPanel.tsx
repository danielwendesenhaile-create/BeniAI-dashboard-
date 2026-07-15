'use client';

import { useEffect, useState } from 'react';
import { Mail, Hash, MessageCircle, CheckCircle2, XCircle, ExternalLink, Loader2, RefreshCw, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'You cancelled the Google sign-in before granting access — try again and approve all requested permissions.',
  missing_code: 'Google did not return an authorization code. Try connecting again.',
  incomplete_token: 'Google did not return a refresh token. Try disconnecting and reconnecting — this can happen on repeat authorizations.',
  exchange_failed: 'Something went wrong exchanging the authorization code. Try again.',
};

interface ConnectionStatus {
  gmail: boolean;
  slack: boolean;
  whatsapp: boolean;
}

interface SlackForm { bot_token: string; team_name: string; }
interface WaForm { phone_number_id: string; access_token: string; verify_token: string; }

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isSecret = type === 'password';
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <div className="relative">
        <input
          type={isSecret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs rounded-lg px-3 py-2 outline-none transition-all pr-8"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-dim)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {isSecret && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100" style={{ color: 'var(--text-muted)' }}>
            {show ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPanel() {
  const [status, setStatus] = useState<ConnectionStatus>({ gmail: false, slack: false, whatsapp: false });
  const [loading, setLoading] = useState(true);

  const [slackForm, setSlackForm] = useState<SlackForm>({ bot_token: '', team_name: '' });
  const [waForm, setWaForm] = useState<WaForm>({ phone_number_id: '', access_token: '', verify_token: '' });
  const [saving, setSaving] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations/status')
      .then((r) => r.json())
      .then(setStatus)
      .finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error');
    const connected = params.get('connected');
    if (errorCode) setBannerError(ERROR_MESSAGES[errorCode] ?? `Connection failed (${errorCode}).`);
    if (connected) setBannerSuccess(`${connected.charAt(0).toUpperCase()}${connected.slice(1)} connected successfully.`);
    if (errorCode || connected) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  async function connectSlack() {
    if (!slackForm.bot_token) return;
    setSaving('slack');
    const res = await fetch('/api/integrations/slack/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackForm),
    });
    if (res.ok) setStatus((s) => ({ ...s, slack: true }));
    setSaving(null);
  }

  async function connectWhatsApp() {
    if (!waForm.phone_number_id || !waForm.access_token || !waForm.verify_token) return;
    setSaving('whatsapp');
    const res = await fetch('/api/integrations/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waForm),
    });
    if (res.ok) setStatus((s) => ({ ...s, whatsapp: true }));
    setSaving(null);
  }

  async function disconnect(provider: keyof ConnectionStatus) {
    const endpoints: Record<string, string> = {
      gmail: '/api/integrations/gmail/sync', // placeholder — clears via token store
      slack: '/api/integrations/slack/connect',
      whatsapp: '/api/integrations/whatsapp/connect',
    };
    await fetch(endpoints[provider], { method: 'DELETE' });
    setStatus((s) => ({ ...s, [provider]: false }));
  }

  async function syncNow() {
    setSyncing(true);
    setSyncStatus('Syncing all sources…');
    const res = await fetch('/api/integrations/sync');
    const data = await res.json();
    setSyncStatus(`Synced ${data.count ?? 0} new items from ${Object.values(data.sources ?? {}).filter(Boolean).length} source(s)`);
    setSyncing(false);
  }

  const integrations = [
    {
      id: 'gmail' as const,
      name: 'Gmail',
      icon: Mail,
      color: '#ef4444',
      description: 'Read unread inbox messages and draft AI replies via Google OAuth.',
      connectHref: '/api/integrations/gmail/auth',
      oauthFlow: true,
    },
    {
      id: 'slack' as const,
      name: 'Slack',
      icon: Hash,
      color: '#a855f7',
      description: 'Monitor channels and DMs using a Slack Bot Token.',
      oauthFlow: false,
    },
    {
      id: 'whatsapp' as const,
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#22c55e',
      description: 'Receive and classify WhatsApp messages via Meta Cloud API webhook.',
      oauthFlow: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Integrations</h1>
          <button
            onClick={syncNow}
            disabled={syncing || (!status.gmail && !status.slack)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--accent-gold)', color: '#09090b' }}
          >
            {syncing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            Sync Now
          </button>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Connect your communication channels. All messages are classified by BeniAI agents before reaching your feed.
        </p>
        {syncStatus && (
          <p className="text-xs mt-2" style={{ color: 'var(--accent-green)' }}>{syncStatus}</p>
        )}
      </div>

      {bannerError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
          <AlertTriangle size={14} className="flex-shrink-0" />
          {bannerError}
        </div>
      )}
      {bannerSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
          <CheckCircle2 size={14} className="flex-shrink-0" />
          {bannerSuccess}
        </div>
      )}

      {/* Cards */}
      {integrations.map((intg) => {
        const Icon = intg.icon;
        const connected = status[intg.id];
        return (
          <div
            key={intg.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: `1px solid ${connected ? `${intg.color}30` : 'var(--border)'}` }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${intg.color}15`, border: `1px solid ${intg.color}30` }}>
                <Icon size={16} style={{ color: intg.color }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{intg.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{intg.description}</div>
              </div>
              <div className="flex items-center gap-2">
                {connected ? (
                  <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                ) : (
                  <XCircle size={16} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                )}
                <span className="text-xs font-medium" style={{ color: connected ? '#22c55e' : 'var(--text-muted)' }}>
                  {connected ? 'Connected' : 'Not connected'}
                </span>
              </div>
            </div>

            {/* Connect form / actions */}
            <div className="px-5 py-4">
              {connected ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {intg.id === 'whatsapp'
                      ? `Webhook: ${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://your-domain.com'}/api/integrations/whatsapp/webhook`
                      : intg.id === 'slack'
                      ? `Events URL: ${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://your-domain.com'}/api/integrations/slack/events`
                      : 'Gmail OAuth active'}
                  </span>
                  <button
                    onClick={() => disconnect(intg.id)}
                    className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]"
                    style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : intg.oauthFlow ? (
                // Gmail — OAuth redirect button
                <a
                  href={intg.connectHref}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                  style={{ background: intg.color, color: '#fff' }}
                >
                  <ExternalLink size={12} />
                  Connect with Google
                </a>
              ) : intg.id === 'slack' ? (
                // Slack — bot token form
                <div className="flex flex-col gap-3">
                  <Field label="Bot Token" value={slackForm.bot_token} onChange={(v) => setSlackForm((f) => ({ ...f, bot_token: v }))} type="password" placeholder="xoxb-…" />
                  <Field label="Workspace name (optional)" value={slackForm.team_name} onChange={(v) => setSlackForm((f) => ({ ...f, team_name: v }))} placeholder="Acme Corp" />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={connectSlack}
                      disabled={saving === 'slack' || !slackForm.bot_token}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: '#a855f7', color: '#fff' }}
                    >
                      {saving === 'slack' ? <Loader2 size={11} className="animate-spin" /> : <Hash size={11} />}
                      Connect Slack
                    </button>
                    <a
                      href="https://api.slack.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <ExternalLink size={10} /> Get bot token
                    </a>
                  </div>
                </div>
              ) : (
                // WhatsApp — Meta Cloud API form
                <div className="flex flex-col gap-3">
                  <Field label="Phone Number ID" value={waForm.phone_number_id} onChange={(v) => setWaForm((f) => ({ ...f, phone_number_id: v }))} placeholder="123456789012345" />
                  <Field label="Access Token" value={waForm.access_token} onChange={(v) => setWaForm((f) => ({ ...f, access_token: v }))} type="password" placeholder="EAAxxxxxx…" />
                  <Field label="Verify Token (choose any secret string)" value={waForm.verify_token} onChange={(v) => setWaForm((f) => ({ ...f, verify_token: v }))} type="password" placeholder="my-verify-secret" />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Set webhook URL in Meta Developer Console →{' '}
                    <code style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-geist-mono)' }}>
                      /api/integrations/whatsapp/webhook
                    </code>
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={connectWhatsApp}
                      disabled={saving === 'whatsapp' || !waForm.phone_number_id || !waForm.access_token || !waForm.verify_token}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: '#22c55e', color: '#09090b' }}
                    >
                      {saving === 'whatsapp' ? <Loader2 size={11} className="animate-spin" /> : <MessageCircle size={11} />}
                      Connect WhatsApp
                    </button>
                    <a
                      href="https://developers.facebook.com/apps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <ExternalLink size={10} /> Meta Developer Console
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Webhook reference */}
      <div className="rounded-xl px-5 py-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>API Endpoints Reference</div>
        <div className="flex flex-col gap-1.5" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.7rem' }}>
          {[
            ['POST', '/api/router', 'Classify any message'],
            ['POST', '/api/agents/email', 'Draft email reply'],
            ['POST', '/api/agents/email/stream', 'Stream email draft'],
            ['POST', '/api/agents/scheduler', 'Parse calendar request'],
            ['POST', '/api/agents/guardian', 'Detect emergencies'],
            ['GET', '/api/integrations/sync', 'Pull from all sources'],
            ['GET', '/api/integrations/gmail/auth', 'Start Gmail OAuth'],
            ['POST', '/api/integrations/slack/connect', 'Save Slack token'],
            ['POST', '/api/integrations/whatsapp/connect', 'Save WhatsApp config'],
            ['POST', '/api/integrations/whatsapp/webhook', 'WhatsApp webhook'],
            ['POST', '/api/integrations/slack/events', 'Slack Events webhook'],
          ].map(([method, path, desc]) => (
            <div key={path} className="flex items-center gap-3">
              <span
                className="text-xs px-1.5 py-0.5 rounded font-bold w-10 text-center flex-shrink-0"
                style={{
                  background: method === 'GET' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                  color: method === 'GET' ? '#22c55e' : '#3b82f6',
                }}
              >
                {method}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{path}</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
