'use client';

import { useState } from 'react';
import LeftNav from '@/components/LeftNav';
import {
  Search, Plus, Mail, MessageCircle, Hash,
  Star, Phone, Building2, Globe, MoreHorizontal,
  Zap, Filter, ChevronRight, TrendingUp,
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone?: string;
  website?: string;
  initials: string;
  color: string;
  tags: string[];
  lastContact: string;
  starred: boolean;
  aiSummary: string;
  interactions: number;
  channel: 'gmail' | 'slack' | 'whatsapp';
}

const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Marcus Webb', role: 'Managing Partner', company: 'Venture Capital Partners', email: 'm.webb@venturecap.io', phone: '+1 415 555 0192', initials: 'MW', color: '#d4af37', tags: ['Investor', 'Series B'], lastContact: '2h ago', starred: true, channel: 'gmail', interactions: 47, aiSummary: 'Lead investor on Series B. Sent term sheet today — expires 5PM. High urgency follow-up needed.' },
  { id: 'c2', name: 'Jennifer Liu', role: 'Senior Partner', company: 'Meridian Law Group', email: 'j.liu@meridianlaw.com', phone: '+1 650 555 0847', initials: 'JL', color: '#ef4444', tags: ['Legal', 'Series B', 'Contract'], lastContact: '1d ago', starred: true, channel: 'gmail', interactions: 22, aiSummary: 'Lead counsel on Series B term sheet. Guardian flagged clause 7.2 — needs your review before countersign.' },
  { id: 'c3', name: 'Priya Nair', role: 'VP Engineering', company: 'Internal', email: 'p.nair@yourcompany.com', initials: 'PN', color: '#a855f7', tags: ['Team', 'Engineering'], lastContact: '43m ago', starred: false, channel: 'slack', interactions: 183, aiSummary: 'Leads EU cluster incident response. Currently managing production rollback — 80% complete.' },
  { id: 'c4', name: 'James Okafor', role: 'Founder & CEO', company: 'Stealth Startup', email: 'james@okafor.me', phone: '+1 628 555 0374', initials: 'JO', color: '#22c55e', tags: ['Network', 'Founder'], lastContact: '6h ago', starred: false, channel: 'whatsapp', interactions: 12, aiSummary: 'Warm contact — building something new. Coffee meeting confirmed for Wednesday 9:30 AM.' },
  { id: 'c5', name: 'Sophia Chen', role: 'Executive Assistant', company: 'Internal', email: 'sophia@yourcompany.com', initials: 'SC', color: '#3b82f6', tags: ['Team', 'EA'], lastContact: '3h ago', starred: true, channel: 'gmail', interactions: 312, aiSummary: 'Manages your calendar. Flagged Thursday LP/Roadmap conflict — rescheduled roadmap to Friday 2PM.' },
  { id: 'c6', name: 'Lena Richter', role: 'Head of Sales', company: 'Internal', email: 'l.richter@yourcompany.com', initials: 'LR', color: '#f59e0b', tags: ['Team', 'Sales'], lastContact: '5h ago', starred: false, channel: 'slack', interactions: 98, aiSummary: 'Just closed Acme Corp — $240K ARR, 2-year deal. Needs CSM assigned by EOD today.' },
  { id: 'c7', name: 'David Park', role: 'Head of Comms', company: 'Internal', email: 'd.park@yourcompany.com', phone: '+1 415 555 0211', initials: 'DP', color: '#06b6d4', tags: ['Team', 'PR'], lastContact: '9h ago', starred: false, channel: 'whatsapp', interactions: 67, aiSummary: 'Flagged TechCrunch article — you\'re quoted in para 3 & 7. Competitor comparison in para 9 may need a comms response.' },
  { id: 'c8', name: 'Finance Team', role: 'Finance', company: 'Internal', email: 'finance@yourcompany.com', initials: 'FT', color: '#10b981', tags: ['Team', 'Finance'], lastContact: '8h ago', starred: false, channel: 'gmail', interactions: 41, aiSummary: 'Q2 board deck locked. Awaiting your sign-off on slide 12 (cash runway) before noon upload.' },
];

const CHANNEL_ICONS = { gmail: Mail, slack: Hash, whatsapp: MessageCircle };
const CHANNEL_COLORS = { gmail: '#ef4444', slack: '#a855f7', whatsapp: '#22c55e' };
const TAGS_ALL = Array.from(new Set(CONTACTS.flatMap((c) => c.tags)));

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(CONTACTS[0]);
  const [starred, setStarred] = useState<Record<string, boolean>>(
    Object.fromEntries(CONTACTS.map((c) => [c.id, c.starred]))
  );

  const filtered = CONTACTS.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || c.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 flex overflow-hidden">

        {/* ── Contact list ── */}
        <div className="flex flex-col border-r" style={{ width: 320, borderColor: 'var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
          {/* Header */}
          <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Contacts</h1>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{CONTACTS.length} people</p>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-90"
                style={{ background: 'var(--accent-gold)', color: '#09090b' }}>
                <Plus size={15} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts…"
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Tag filters */}
          <div className="flex gap-1.5 px-5 py-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setActiveTag(null)}
              className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all"
              style={{ background: !activeTag ? 'var(--accent-gold)' : 'var(--bg-elevated)', color: !activeTag ? '#09090b' : 'var(--text-muted)' }}>
              All
            </button>
            {TAGS_ALL.map((t) => (
              <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)}
                className="px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all"
                style={{ background: activeTag === t ? 'rgba(212,175,55,0.15)' : 'var(--bg-elevated)', color: activeTag === t ? 'var(--accent-gold)' : 'var(--text-muted)', border: activeTag === t ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)' }}>
                {t}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => {
              const ChanIcon = CHANNEL_ICONS[c.channel];
              const isActive = selected?.id === c.id;
              return (
                <div key={c.id} onClick={() => setSelected(c)}
                  className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all border-b"
                  style={{
                    background: isActive ? 'rgba(212,175,55,0.06)' : 'transparent',
                    borderColor: 'var(--border)',
                    borderLeft: isActive ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: c.color, color: '#09090b' }}>
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                      {starred[c.id] && <Star size={10} fill="#d4af37" style={{ color: '#d4af37', flexShrink: 0 }} />}
                    </div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.role} · {c.company}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <ChanIcon size={11} style={{ color: CHANNEL_COLORS[c.channel] }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.lastContact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Contact detail ── */}
        {selected ? (
          <div className="flex-1 overflow-y-auto">
            {/* Profile header */}
            <div className="px-8 py-8 flex items-start gap-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{ background: selected.color, color: '#09090b' }}>
                {selected.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{selected.role} at {selected.company}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selected.tags.map((t) => (
                        <span key={t} className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setStarred((s) => ({ ...s, [selected.id]: !s[selected.id] }))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <Star size={14} fill={starred[selected.id] ? '#d4af37' : 'none'} style={{ color: starred[selected.id] ? '#d4af37' : 'var(--text-muted)' }} />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <MoreHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 grid md:grid-cols-2 gap-6">
              {/* Contact info */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Contact Info</h3>
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  {[
                    { icon: Mail, label: 'Email', value: selected.email },
                    ...(selected.phone ? [{ icon: Phone, label: 'Phone', value: selected.phone }] : []),
                    { icon: Building2, label: 'Company', value: selected.company },
                    ...(selected.website ? [{ icon: Globe, label: 'Website', value: selected.website }] : []),
                  ].map(({ icon: Icon, label, value }, i, arr) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <Icon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <Mail size={13} /> Draft Email
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}>
                    <Hash size={13} /> Message
                  </button>
                </div>
              </div>

              {/* AI Summary */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>AI Summary</h3>
                <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div className="flex items-center gap-2">
                    <Zap size={13} style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent-gold)' }}>BeniAI Context</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selected.aiSummary}</p>
                </div>

                <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Activity</h3>
                <div className="rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <TrendingUp size={14} style={{ color: 'var(--accent-gold)' }} />
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selected.interactions} interactions</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>tracked by BeniAI</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    {(() => { const Icon = CHANNEL_ICONS[selected.channel]; return <Icon size={14} style={{ color: CHANNEL_COLORS[selected.channel] }} />; })()}
                    <div className="flex-1">
                      <div className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>Last via {selected.channel}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{selected.lastContact}</div>
                    </div>
                    <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a contact</p>
          </div>
        )}
      </main>
    </div>
  );
}
