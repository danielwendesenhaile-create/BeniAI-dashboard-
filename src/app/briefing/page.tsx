'use client';

import { useEffect, useState } from 'react';
import LeftNav from '@/components/LeftNav';
import Link from 'next/link';
import {
  Zap, AlertTriangle, Clock, Brain, TrendingUp,
  Mail, Hash, MessageCircle, ChevronRight, RefreshCw,
  Loader2, Sun, Moon, Sunset, Shield, CalendarDays,
  Sparkles, ArrowRight, FileText,
} from 'lucide-react';
import { mockPriorityItems } from '@/data/mockData';

interface Briefing {
  greeting: string;
  headline: string;
  priorities: string[];
  watchOut: string;
  aiInsight: string;
  mood: 'calm' | 'busy' | 'critical';
}

const MOOD_CONFIG = {
  calm: { color: '#22c55e', label: 'Calm day', icon: Sun, bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' },
  busy: { color: '#f59e0b', label: 'Busy day', icon: Sunset, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  critical: { color: '#ef4444', label: 'Critical day', icon: AlertTriangle, bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
};

const SOURCE_ICON = { gmail: Mail, slack: Hash, whatsapp: MessageCircle };
const SOURCE_COLOR = { gmail: '#ef4444', slack: '#a855f7', whatsapp: '#22c55e' };
const CATEGORY_COLOR: Record<string, string> = { Emergency: '#ef4444', Urgent: '#f59e0b', Scheduling: '#3b82f6', Informational: '#52525b' };

const TODAYS_EVENTS = [
  { time: '10:00 AM', title: 'LP Quarterly Review', location: 'Board Room A', duration: '3h', color: '#d4af37' },
  { time: '2:00 PM', title: 'Series B — Legal Sync', location: 'Zoom', duration: '45m', color: '#ef4444' },
  { time: '5:00 PM', title: 'Deep Work Block', location: null, duration: '2h', color: '#3b82f6' },
];

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tldrId, setTldrId] = useState<string | null>(null);
  const [tldrMap, setTldrMap] = useState<Record<string, string>>({});

  const hour = new Date().getHours();
  const timeIcon = hour < 12 ? Sun : hour < 17 ? Sunset : Moon;
  const TimeIcon = timeIcon;

  async function loadBriefing(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await fetch('/api/briefing');
      const data = await res.json();
      setBriefing(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function getTldr(id: string, body: string) {
    if (tldrMap[id]) { setTldrId(id); return; }
    setTldrId(id);
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body, type: 'message' }),
    });
    const { summary } = await res.json();
    setTldrMap((m) => ({ ...m, [id]: summary }));
  }

  useEffect(() => { loadBriefing(); }, []);

  const topItems = [...mockPriorityItems].sort((a, b) => b.urgencyScore - a.urgencyScore).slice(0, 5);
  const mood = briefing ? MOOD_CONFIG[briefing.mood] : null;
  const MoodIcon = mood?.icon ?? Sun;

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 max-w-5xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <TimeIcon size={18} style={{ color: 'var(--accent-gold)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Morning Briefing</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                AI-generated · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={() => loadBriefing(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <Brain size={24} style={{ color: 'var(--accent-gold)' }} className="animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>BeniAI is preparing your briefing</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Analysing your inbox, calendar & priorities…</p>
            </div>
            <Loader2 size={18} style={{ color: 'var(--text-muted)' }} className="animate-spin" />
          </div>
        ) : briefing && (
          <>
            {/* ── AI Briefing card ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              {/* Mood bar */}
              {mood && (
                <div className="flex items-center gap-3 px-6 py-3"
                  style={{ background: mood.bg, borderBottom: `1px solid ${mood.border}` }}>
                  <MoodIcon size={14} style={{ color: mood.color }} />
                  <span className="text-xs font-semibold" style={{ color: mood.color }}>{mood.label}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <Zap size={11} style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Generated by BeniAI</span>
                  </div>
                </div>
              )}

              <div className="px-6 py-5 flex flex-col gap-5">
                {/* Greeting + headline */}
                <div>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{briefing.greeting}</p>
                  <h2 className="text-lg font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {briefing.headline}
                  </h2>
                </div>

                {/* Priorities */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={13} style={{ color: '#f59e0b' }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Top Priorities
                    </span>
                  </div>
                  {briefing.priorities.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                        style={{ background: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#3b82f6', color: '#fff' }}>
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p}</p>
                    </div>
                  ))}
                </div>

                {/* Watch out + AI insight */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl px-4 py-3 flex flex-col gap-2"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="flex items-center gap-2">
                      <Shield size={12} style={{ color: '#ef4444' }} />
                      <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>Watch Out</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{briefing.watchOut}</p>
                  </div>
                  <div className="rounded-xl px-4 py-3 flex flex-col gap-2"
                    style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} style={{ color: 'var(--accent-gold)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-gold)' }}>AI Insight</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{briefing.aiInsight}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row: Today's calendar + top messages ── */}
            <div className="grid lg:grid-cols-2 gap-5">

              {/* Today's calendar */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} style={{ color: '#3b82f6' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Schedule</span>
                  </div>
                  <Link href="/calendar" className="text-xs flex items-center gap-1 hover:opacity-70" style={{ color: '#3b82f6' }}>
                    Full calendar <ArrowRight size={10} />
                  </Link>
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                  {TODAYS_EVENTS.map((ev) => (
                    <div key={ev.title} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</div>
                        <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1"><Clock size={10} />{ev.time} · {ev.duration}</span>
                          {ev.location && <span>· {ev.location}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top messages with TL;DR */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Mail size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Needs Your Attention</span>
                  </div>
                  <Link href="/feed" className="text-xs flex items-center gap-1 hover:opacity-70" style={{ color: 'var(--accent-gold)' }}>
                    All messages <ArrowRight size={10} />
                  </Link>
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                  {topItems.map((item) => {
                    const Icon = SOURCE_ICON[item.source];
                    return (
                      <div key={item.id} className="flex flex-col px-5 py-3">
                        <div className="flex items-start gap-3">
                          <Icon size={13} className="mt-0.5 flex-shrink-0" style={{ color: SOURCE_COLOR[item.source] }} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.subject}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.sender.split('<')[0].trim()}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: `${CATEGORY_COLOR[item.category]}18`, color: CATEGORY_COLOR[item.category] }}>
                              {item.category}
                            </span>
                            <button onClick={() => getTldr(item.id, item.preview)}
                              className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all hover:opacity-80"
                              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                              <FileText size={9} /> TL;DR
                            </button>
                          </div>
                        </div>
                        {tldrId === item.id && (
                          <div className="mt-2 ml-5 px-3 py-2 rounded-lg text-xs leading-relaxed"
                            style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--text-secondary)' }}>
                            {tldrMap[item.id]
                              ? <><Sparkles size={10} className="inline mr-1" style={{ color: 'var(--accent-gold)' }} />{tldrMap[item.id]}</>
                              : <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Summarising…</span>
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Quick navigation ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Open Priority Feed', href: '/feed', color: '#d4af37', icon: Mail },
                { label: 'View Calendar', href: '/calendar', color: '#3b82f6', icon: CalendarDays },
                { label: 'View Analytics', href: '/analytics', color: '#22c55e', icon: TrendingUp },
                { label: 'Audit Log', href: '/audit', color: '#a855f7', icon: Shield },
              ].map(({ label, href, color, icon: Icon }) => (
                <Link key={label} href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <Icon size={15} style={{ color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <ChevronRight size={11} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
