'use client';

import { useState } from 'react';
import LeftNav from '@/components/LeftNav';
import { Shield, Download, Search, Filter, CheckCircle2, AlertTriangle, Zap, Mail, Hash, MessageCircle, Calendar, Settings, User, Lock } from 'lucide-react';

type ActionType = 'send' | 'classify' | 'draft' | 'login' | 'setting' | 'integration' | 'alert';

interface AuditEntry {
  id: string;
  ts: string;
  type: ActionType;
  actor: string;
  action: string;
  detail: string;
  status: 'success' | 'failed' | 'warning';
  source?: string;
}

const ENTRIES: AuditEntry[] = [
  { id: 'a1', ts: '2026-07-15 09:31:12', type: 'classify', actor: 'Router Agent', action: 'Message classified', detail: 'Slack message from Priya Nair → Emergency (score 5/5)', status: 'success', source: 'slack' },
  { id: 'a2', ts: '2026-07-15 09:31:13', type: 'alert', actor: 'Guardian Agent', action: 'Emergency alert fired', detail: 'EU production downtime detected — CEO notified', status: 'warning' },
  { id: 'a3', ts: '2026-07-15 09:14:08', type: 'classify', actor: 'Router Agent', action: 'Message classified', detail: 'Gmail from Marcus Webb → Emergency (score 5/5)', status: 'success', source: 'gmail' },
  { id: 'a4', ts: '2026-07-15 09:14:09', type: 'draft', actor: 'Email Agent', action: 'Draft generated', detail: 'Series B term sheet reply · 172 tokens · Formal tone', status: 'success' },
  { id: 'a5', ts: '2026-07-15 08:52:44', type: 'classify', actor: 'Router Agent', action: 'Message classified', detail: 'WhatsApp from James Okafor → Scheduling (score 2/5)', status: 'success', source: 'whatsapp' },
  { id: 'a6', ts: '2026-07-15 08:52:45', type: 'draft', actor: 'Scheduler Agent', action: 'Meeting slot proposed', detail: 'Wednesday 9:30 AM slot confirmed · Calendar event created', status: 'success' },
  { id: 'a7', ts: '2026-07-15 08:01:00', type: 'integration', actor: 'System', action: 'Gmail sync completed', detail: '14 new messages fetched · 0 errors', status: 'success', source: 'gmail' },
  { id: 'a8', ts: '2026-07-15 08:00:59', type: 'integration', actor: 'System', action: 'Slack sync completed', detail: '3 channels scanned · 2 new messages', status: 'success', source: 'slack' },
  { id: 'a9', ts: '2026-07-15 07:00:00', type: 'login', actor: 'Chief Executive', action: 'Sign in', detail: 'Google OAuth · San Francisco, CA · Chrome/MacOS', status: 'success' },
  { id: 'a10', ts: '2026-07-14 23:59:01', type: 'classify', actor: 'Guardian Agent', action: 'Nightly scan completed', detail: 'Scanned 47 messages · No anomalies detected', status: 'success' },
  { id: 'a11', ts: '2026-07-14 18:22:10', type: 'send', actor: 'Chief Executive', action: 'Reply sent via Gmail', detail: 'To: finance@yourcompany.com · Subject: Re: Board Deck Numbers', status: 'success', source: 'gmail' },
  { id: 'a12', ts: '2026-07-14 15:04:33', type: 'setting', actor: 'Chief Executive', action: 'Settings updated', detail: 'Default tone changed: Formal → Friendly', status: 'success' },
  { id: 'a13', ts: '2026-07-14 11:30:00', type: 'integration', actor: 'System', action: 'WhatsApp webhook received', detail: 'Message from +1628555XXXX · Classified as Informational', status: 'success', source: 'whatsapp' },
  { id: 'a14', ts: '2026-07-14 10:15:22', type: 'draft', actor: 'Email Agent', action: 'Draft generation failed', detail: 'Anthropic API timeout after 30s · Retried 3×', status: 'failed' },
  { id: 'a15', ts: '2026-07-14 09:00:00', type: 'login', actor: 'Chief Executive', action: 'Sign in', detail: 'Google OAuth · San Francisco, CA · Safari/iPhone', status: 'success' },
];

const TYPE_CONFIG: Record<ActionType, { icon: React.ElementType; color: string; label: string }> = {
  send: { icon: Mail, color: '#22c55e', label: 'Send' },
  classify: { icon: Zap, color: '#d4af37', label: 'Classify' },
  draft: { icon: Mail, color: '#3b82f6', label: 'Draft' },
  login: { icon: User, color: '#a855f7', label: 'Auth' },
  setting: { icon: Settings, color: '#f59e0b', label: 'Settings' },
  integration: { icon: Hash, color: '#06b6d4', label: 'Sync' },
  alert: { icon: AlertTriangle, color: '#ef4444', label: 'Alert' },
};

const SOURCE_ICON: Record<string, React.ElementType> = { gmail: Mail, slack: Hash, whatsapp: MessageCircle };
const SOURCE_COLOR: Record<string, string> = { gmail: '#ef4444', slack: '#a855f7', whatsapp: '#22c55e' };

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ActionType | 'all'>('all');

  const filtered = ENTRIES.filter((e) => {
    const matchSearch = !search || e.action.toLowerCase().includes(search.toLowerCase()) || e.detail.toLowerCase().includes(search.toLowerCase()) || e.actor.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || e.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Audit Log</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Every action BeniAI takes on your behalf — timestamped, immutable
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Trust badge */}
        <div className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
          style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Lock size={15} style={{ color: '#22c55e' }} />
          <div className="flex-1">
            <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>Tamper-proof audit trail</span>
            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
              All entries are append-only. BeniAI never edits or deletes your data without a logged action.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
            <span className="text-xs font-medium" style={{ color: '#22c55e' }}>SOC 2 Ready</span>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, actors, details…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <Filter size={12} className="mx-2" style={{ color: 'var(--text-muted)' }} />
            {(['all', 'send', 'classify', 'draft', 'alert', 'login', 'integration', 'setting'] as const).map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={{ background: filterType === t ? 'var(--accent-gold)' : 'transparent', color: filterType === t ? '#09090b' : 'var(--text-muted)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {ENTRIES.length} entries · Last 30 days
        </p>

        {/* Entries */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((entry) => {
              const tc = TYPE_CONFIG[entry.type];
              const TypeIcon = tc.icon;
              const SrcIcon = entry.source ? SOURCE_ICON[entry.source] : null;
              return (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-4 transition-all hover:opacity-90"
                  style={{ background: entry.status === 'failed' ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                  {/* Type icon */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${tc.color}15`, border: `1px solid ${tc.color}30` }}>
                    <TypeIcon size={14} style={{ color: tc.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{entry.action}</span>
                      {SrcIcon && (
                        <div className="flex items-center gap-1">
                          <SrcIcon size={10} style={{ color: SOURCE_COLOR[entry.source!] }} />
                        </div>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: entry.status === 'success' ? 'rgba(34,197,94,0.1)' : entry.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: entry.status === 'success' ? '#22c55e' : entry.status === 'failed' ? '#ef4444' : '#f59e0b',
                        }}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{entry.detail}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: '#3f3f46' }}>{entry.actor}</span>
                      <span className="text-xs" style={{ color: '#3f3f46' }}>·</span>
                      <span className="text-xs" style={{ color: '#3f3f46' }}>{entry.ts}</span>
                    </div>
                  </div>

                  {/* Type badge */}
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                    style={{ background: `${tc.color}12`, color: tc.color, border: `1px solid ${tc.color}25` }}>
                    {tc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
