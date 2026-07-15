'use client';

import { useState } from 'react';
import LeftNav from '@/components/LeftNav';
import Link from 'next/link';
import {
  Zap, Mail, Hash, MessageCircle, Shield, CalendarDays,
  ArrowRight, Clock, CheckCircle2, AlertTriangle, Brain,
  ChevronRight, Users, Plug, Sparkles, Send, Loader2,
  MapPin, TrendingUp, Star, Building2,
} from 'lucide-react';
import { mockPriorityItems, mockSystemStats, mockAgentLogs } from '@/data/mockData';

// ── shared styles ─────────────────────────────────────────────────────────────
const card = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
};
const SOURCE_ICON = { gmail: Mail, slack: Hash, whatsapp: MessageCircle };
const SOURCE_COLOR = { gmail: '#ef4444', slack: '#a855f7', whatsapp: '#22c55e' };
const URGENCY_COLOR: Record<number, string> = { 5: '#ef4444', 4: '#f59e0b', 3: '#3b82f6', 2: '#22c55e', 1: '#52525b' };
const AGENT_COLOR: Record<string, string> = { Router: '#d4af37', Guardian: '#ef4444', Email: '#3b82f6', Scheduler: '#22c55e' };

// ── Calendar data ─────────────────────────────────────────────────────────────
const TODAY_EVENTS = [
  { id: 't1', title: 'LP Quarterly Review', time: '10:00 AM', duration: '3h', color: '#d4af37', location: 'Board Room A', attendees: 6 },
  { id: 't2', title: 'Series B — Legal Sync', time: '2:00 PM', duration: '45m', color: '#ef4444', location: 'Zoom', attendees: 3 },
  { id: 't3', title: 'Deep Work Block', time: '5:00 PM', duration: '2h', color: '#3b82f6', location: null, attendees: 0 },
];
const UPCOMING_EVENTS = [
  { day: 'Wed', date: '17', title: 'Coffee — James Okafor', time: '9:30 AM', color: '#22c55e' },
  { day: 'Thu', date: '18', title: 'Product Roadmap Review', time: '2:00 PM', color: '#a855f7' },
  { day: 'Fri', date: '19', title: 'Investor Roadshow Prep', time: '9:00 AM', color: '#f59e0b' },
];

// ── Top contacts ──────────────────────────────────────────────────────────────
const TOP_CONTACTS = [
  { name: 'Marcus Webb', role: 'Lead Investor', initials: 'MW', color: '#d4af37', lastMsg: '2h ago', channel: 'gmail' as const, starred: true },
  { name: 'Jennifer Liu', role: 'Legal Counsel', initials: 'JL', color: '#ef4444', lastMsg: '1d ago', channel: 'gmail' as const, starred: true },
  { name: 'Priya Nair', role: 'VP Engineering', initials: 'PN', color: '#a855f7', lastMsg: '43m ago', channel: 'slack' as const, starred: false },
  { name: 'Sophia Chen', role: 'Executive Assistant', initials: 'SC', color: '#3b82f6', lastMsg: '3h ago', channel: 'gmail' as const, starred: true },
];

// ── Integration status ────────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: 'Gmail', icon: Mail, color: '#ef4444', connected: true, stat: '247 synced today' },
  { name: 'Slack', icon: Hash, color: '#a855f7', connected: true, stat: '3 channels active' },
  { name: 'WhatsApp', icon: MessageCircle, color: '#22c55e', connected: false, stat: 'Not connected' },
];

function SectionHeader({ title, icon: Icon, color, href, linkLabel = 'View all' }: {
  title: string; icon: React.ElementType; color: string; href: string; linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <Link href={href} className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
        style={{ color }}>
        {linkLabel} <ArrowRight size={11} />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const [draftMsg, setDraftMsg] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState('');

  const emergencies = mockPriorityItems.filter((i) => i.category === 'Emergency');
  const urgent = mockPriorityItems.filter((i) => i.category === 'Urgent');
  const recentLogs = mockAgentLogs.slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  async function handleDraft() {
    if (!draftMsg.trim()) return;
    setDrafting(true);
    setDraft('');
    try {
      const res = await fetch('/api/agents/email/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'Dashboard Quick Draft', subject: draftMsg, body: draftMsg }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setDraft(result);
      }
    } finally {
      setDrafting(false);
    }
  }

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {greeting}, Executive
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {' · '}{mockPriorityItems.length} messages waiting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All agents live
            </div>
          </div>
        </div>

        {/* ── Emergency banner ── */}
        {emergencies.length > 0 && (
          <Link href="/feed"
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all hover:opacity-90"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold" style={{ color: '#ef4444' }}>
                {emergencies.length} Emergency — </span>
              <span className="text-sm" style={{ color: '#ef444499' }}>
                {emergencies[0].subject}
              </span>
            </div>
            <ChevronRight size={15} style={{ color: '#ef4444' }} />
          </Link>
        )}

        {/* ── Stat strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {mockSystemStats.map(({ label, value, unit }) => (
            <div key={label} className="rounded-2xl px-5 py-4 flex flex-col gap-1.5" style={card}>
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black" style={{
                  background: 'linear-gradient(135deg,#d4af37,#f5d87a)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{value}</span>
                {unit && <span className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 1: Calendar + AI Draft Composer ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Calendar widget */}
          <div className="rounded-2xl flex flex-col overflow-hidden" style={card}>
            <SectionHeader title="Today's Calendar" icon={CalendarDays} color="#3b82f6" href="/calendar" />
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
              {TODAY_EVENTS.map((ev) => (
                <Link href="/calendar" key={ev.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:opacity-80 transition-opacity">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10} />{ev.time} · {ev.duration}
                      </span>
                      {ev.location && (
                        <span className="text-xs flex items-center gap-1 truncate" style={{ color: 'var(--text-muted)' }}>
                          <MapPin size={10} />{ev.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {ev.attendees > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Users size={11} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ev.attendees}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            {/* Upcoming mini strip */}
            <div className="px-5 pt-3 pb-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Upcoming</span>
              <div className="flex gap-2">
                {UPCOMING_EVENTS.map((ev) => (
                  <Link href="/calendar" key={ev.date}
                    className="flex-1 rounded-xl px-3 py-2.5 flex flex-col gap-1 hover:opacity-80 transition-opacity"
                    style={{ background: `${ev.color}12`, border: `1px solid ${ev.color}25` }}>
                    <span className="text-xs font-bold" style={{ color: ev.color }}>{ev.day} {ev.date}</span>
                    <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{ev.title}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ev.time}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* AI Draft Composer */}
          <div className="rounded-2xl flex flex-col overflow-hidden" style={card}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Draft Composer</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(212,175,55,0.2)' }}>
                Email Agent
              </span>
            </div>
            <div className="flex flex-col gap-3 p-5 flex-1">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Describe what you need to reply to — BeniAI will draft it in your voice.
              </p>
              <textarea
                value={draftMsg}
                onChange={(e) => setDraftMsg(e.target.value)}
                placeholder="e.g. Reply to Marcus about the term sheet — agree to clause 7.2 and confirm signing by 4pm..."
                rows={3}
                className="w-full text-sm rounded-xl px-4 py-3 outline-none resize-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={handleDraft}
                disabled={drafting || !draftMsg.trim()}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--accent-gold)', color: '#09090b' }}>
                {drafting ? <><Loader2 size={14} className="animate-spin" /> Drafting…</> : <><Sparkles size={14} /> Generate Draft</>}
              </button>
              {draft && (
                <div className="rounded-xl p-4 flex flex-col gap-3 flex-1"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div className="flex items-center gap-1.5">
                    <Zap size={11} style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent-gold)' }}>Draft ready</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{draft}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <Send size={11} /> Approve & Send
                    </button>
                    <button onClick={() => { setDraft(''); setDraftMsg(''); }}
                      className="px-3 py-2 rounded-lg text-xs font-medium"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 2: Contacts + Agent Log + Integrations ── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Top Contacts */}
          <div className="rounded-2xl flex flex-col overflow-hidden" style={card}>
            <SectionHeader title="Key Contacts" icon={Users} color="#22c55e" href="/contacts" />
            <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
              {TOP_CONTACTS.map((c) => {
                const ChanIcon = SOURCE_ICON[c.channel];
                return (
                  <Link href="/contacts" key={c.name}
                    className="flex items-center gap-3 px-5 py-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: c.color, color: '#09090b' }}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                        {c.starred && <Star size={10} fill="#d4af37" style={{ color: '#d4af37', flexShrink: 0 }} />}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.role}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <ChanIcon size={11} style={{ color: SOURCE_COLOR[c.channel] }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.lastMsg}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/contacts"
              className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <Building2 size={11} /> View all contacts
            </Link>
          </div>

          {/* Agent Activity Log */}
          <div className="rounded-2xl flex flex-col overflow-hidden" style={card}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Brain size={14} style={{ color: 'var(--accent-gold)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Agent Activity</span>
              <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            </div>
            <div className="flex-1 flex flex-col divide-y overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              {recentLogs.map((log) => (
                <div key={log.id} className="flex gap-3 px-4 py-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: AGENT_COLOR[log.agent] ?? '#52525b' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold" style={{ color: AGENT_COLOR[log.agent] }}>{log.agent}</div>
                    <div className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>{log.message}</div>
                    <div className="text-xs mt-1" style={{ color: '#3f3f46' }}>{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrations status + urgent inbox peek */}
          <div className="flex flex-col gap-4">
            {/* Integration status */}
            <div className="rounded-2xl flex flex-col overflow-hidden" style={card}>
              <SectionHeader title="Integrations" icon={Plug} color="#a855f7" href="/integrations" linkLabel="Manage" />
              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                {INTEGRATIONS.map(({ name, icon: Icon, color, connected, stat }) => (
                  <div key={name} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {connected
                        ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                        : <div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent inbox peek */}
            <div className="rounded-2xl flex flex-col overflow-hidden" style={card}>
              <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <TrendingUp size={14} style={{ color: '#f59e0b' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Urgent</span>
                <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {urgent.length}
                </span>
              </div>
              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                {urgent.slice(0, 2).map((item) => {
                  const Icon = SOURCE_ICON[item.source];
                  return (
                    <Link href="/feed" key={item.id}
                      className="flex items-center gap-3 px-5 py-3 hover:opacity-80 transition-opacity">
                      <Icon size={13} style={{ color: SOURCE_COLOR[item.source] }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.subject}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.timestamp}</div>
                      </div>
                      <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                    </Link>
                  );
                })}
              </div>
              <Link href="/feed"
                className="flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-opacity hover:opacity-70"
                style={{ borderTop: '1px solid var(--border)', color: '#f59e0b' }}>
                Open full feed <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── BeniAI status bar ── */}
        <div className="flex flex-wrap items-center gap-6 px-5 py-3.5 rounded-2xl"
          style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex items-center gap-2">
            <Zap size={13} style={{ color: 'var(--accent-gold)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-gold)' }}>BeniAI</span>
          </div>
          {[
            { icon: CheckCircle2, label: 'All 4 agents running', color: '#22c55e' },
            { icon: Shield, label: 'Guardian: no threats', color: '#a855f7' },
            { icon: Clock, label: `${urgent.length} urgent pending`, color: '#f59e0b' },
            { icon: CalendarDays, label: `${TODAY_EVENTS.length} events today`, color: '#3b82f6' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={12} style={{ color }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
