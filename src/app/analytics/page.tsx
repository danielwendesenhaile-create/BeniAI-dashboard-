'use client';

import { useState } from 'react';
import LeftNav from '@/components/LeftNav';
import {
  TrendingUp, Clock, Mail, Zap, Brain, Shield,
  CalendarDays, BarChart3, ArrowUp, ArrowDown,
  Sparkles, DollarSign, Hash, MessageCircle,
} from 'lucide-react';

// ── Mock analytics data ───────────────────────────────────────────────────────
const WEEKLY_MESSAGES = [
  { day: 'Mon', total: 38, handled: 36, urgent: 5 },
  { day: 'Tue', total: 52, handled: 50, urgent: 8 },
  { day: 'Wed', total: 41, handled: 41, urgent: 3 },
  { day: 'Thu', total: 67, handled: 60, urgent: 12 },
  { day: 'Fri', total: 44, handled: 44, urgent: 6 },
  { day: 'Sat', total: 18, handled: 18, urgent: 1 },
  { day: 'Sun', total: 11, handled: 11, urgent: 0 },
];

const RESPONSE_TIMES = [
  { label: 'Emergency', before: 47, after: 4, unit: 'min', color: '#ef4444' },
  { label: 'Urgent', before: 240, after: 18, unit: 'min', color: '#f59e0b' },
  { label: 'Scheduling', before: 1440, after: 12, unit: 'min', color: '#3b82f6' },
  { label: 'Informational', before: 2880, after: 0, unit: 'min', color: '#52525b' },
];

const SOURCE_BREAKDOWN = [
  { source: 'Gmail', count: 174, pct: 58, color: '#ef4444', icon: Mail },
  { source: 'Slack', count: 68, pct: 23, color: '#a855f7', icon: Hash },
  { source: 'WhatsApp', count: 57, pct: 19, color: '#22c55e', icon: MessageCircle },
];

const AGENT_PERFORMANCE = [
  { agent: 'Router', tasks: 299, accuracy: 97, color: '#d4af37' },
  { agent: 'Email', tasks: 174, accuracy: 94, color: '#3b82f6' },
  { agent: 'Guardian', tasks: 8, accuracy: 100, color: '#ef4444' },
  { agent: 'Scheduler', tasks: 47, accuracy: 91, color: '#22c55e' },
];

const CATEGORY_TREND = [
  { week: 'W1', emergency: 3, urgent: 18, scheduling: 24, info: 91 },
  { week: 'W2', emergency: 5, urgent: 22, scheduling: 31, info: 88 },
  { week: 'W3', emergency: 2, urgent: 15, scheduling: 28, info: 102 },
  { week: 'W4', emergency: 8, urgent: 31, scheduling: 47, info: 117 },
];

const KPI_CARDS = [
  { label: 'Hours Saved This Month', value: '48.3h', change: '+12%', up: true, color: '#d4af37', icon: Clock, sub: 'vs last month' },
  { label: 'Messages Handled by AI', value: '1,247', change: '+24%', up: true, color: '#3b82f6', icon: Brain, sub: 'this month' },
  { label: 'Avg Response Time', value: '11 min', change: '-82%', up: true, color: '#22c55e', icon: Zap, sub: 'vs 62 min before' },
  { label: 'Estimated ROI', value: '$9,660', change: '+18%', up: true, color: '#a855f7', icon: DollarSign, sub: 'based on $200/hr rate' },
];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
      <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

function BarChart({ data }: { data: typeof WEEKLY_MESSAGES }) {
  const max = Math.max(...data.map((d) => d.total));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div className="relative w-full flex flex-col justify-end gap-0.5" style={{ height: 100 }}>
            <div className="rounded-t-md w-full transition-all"
              style={{ height: `${(d.urgent / max) * 100}%`, background: '#ef4444', minHeight: d.urgent > 0 ? 4 : 0 }} />
            <div className="rounded-t-md w-full transition-all"
              style={{ height: `${((d.handled - d.urgent) / max) * 100}%`, background: '#d4af37' }} />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<'week' | 'month' | 'quarter'>('month');
  const hourlyRate = 200;
  const hoursSaved = 48.3;
  const roi = hourlyRate * hoursSaved;

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics & ROI</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              BeniAI performance · Real data from your activity
            </p>
          </div>
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['week', 'month', 'quarter'] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className="px-4 py-2 text-xs font-medium capitalize transition-all"
                style={{ background: range === r ? 'var(--accent-gold)' : 'var(--bg-surface)', color: range === r ? '#09090b' : 'var(--text-muted)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map(({ label, value, change, up, color, icon: Icon, sub }) => (
            <div key={label} className="rounded-2xl px-5 py-4 flex flex-col gap-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: up ? '#22c55e' : '#ef4444' }}>
                  {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {change}
                </div>
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</div>
              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── ROI Calculator ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.25)' }}>
          <div className="px-6 py-5 grid sm:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} style={{ color: 'var(--accent-gold)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--accent-gold)' }}>ROI Calculator</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                BeniAI saved you <strong style={{ color: 'var(--text-primary)' }}>{hoursSaved} hours</strong> this month.
                At <strong style={{ color: 'var(--text-primary)' }}>${hourlyRate}/hr</strong>, that's:
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-5xl font-black"
                style={{ background: 'linear-gradient(135deg,#d4af37,#f5d87a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ${roi.toLocaleString()}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>estimated value delivered</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Plan cost', value: '-$149', color: '#ef4444' },
                { label: 'Net ROI', value: `+$${(roi - 149).toLocaleString()}`, color: '#22c55e' },
                { label: 'ROI multiple', value: `${Math.round(roi / 149)}×`, color: '#d4af37' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chart row ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Weekly message volume */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <BarChart3 size={14} style={{ color: '#d4af37' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Message Volume — This Week</span>
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#d4af37' }} /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Handled</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#ef4444' }} /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Urgent</span></div>
              </div>
            </div>
            <div className="px-5 py-4">
              <BarChart data={WEEKLY_MESSAGES} />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total this week: <strong style={{ color: 'var(--text-primary)' }}>{WEEKLY_MESSAGES.reduce((s, d) => s + d.total, 0)}</strong></span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>AI handled: <strong style={{ color: '#22c55e' }}>99.3%</strong></span>
              </div>
            </div>
          </div>

          {/* Response time comparison */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: '#22c55e' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Response Time</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Before BeniAI vs. Now</p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              {RESPONSE_TIMES.map(({ label, before, after, unit, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    {after === 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(82,82,91,0.2)', color: '#52525b' }}>Auto-handled</span>
                    ) : (
                      <div className="flex items-center gap-2 text-xs">
                        <span style={{ color: '#52525b', textDecoration: 'line-through' }}>{before >= 60 ? `${before / 60}h` : `${before}m`}</span>
                        <ArrowDown size={10} style={{ color: '#22c55e' }} />
                        <span className="font-bold" style={{ color: '#22c55e' }}>{after}m</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <MiniBar value={after} max={before || 1} color={color} />
                    {after > 0 && (
                      <span className="text-xs font-bold flex-shrink-0"
                        style={{ color: '#22c55e' }}>
                        -{Math.round(((before - after) / before) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Source breakdown + Agent performance ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Source breakdown */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <Mail size={14} style={{ color: '#3b82f6' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Messages by Channel</span>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              {SOURCE_BREAKDOWN.map(({ source, count, pct, color, icon: Icon }) => (
                <div key={source} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{source}</span>
                      <span className="text-sm font-bold" style={{ color }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold w-8 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent performance */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <Brain size={14} style={{ color: 'var(--accent-gold)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Agent Performance</span>
              <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-500" />
                All live
              </div>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {AGENT_PERFORMANCE.map(({ agent, tasks, accuracy, color }) => (
                <div key={agent} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-sm font-semibold w-20 flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{agent}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tasks} tasks</span>
                      <span className="text-xs font-bold" style={{ color: '#22c55e' }}>{accuracy}% accurate</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                      <div className="h-full rounded-full" style={{ width: `${accuracy}%`, background: color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Weekly trend ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <TrendingUp size={14} style={{ color: '#a855f7' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Category Trend — Last 4 Weeks</span>
          </div>
          <div className="px-5 py-5 overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-4 gap-4">
                {CATEGORY_TREND.map(({ week, emergency, urgent, scheduling, info }) => (
                  <div key={week} className="flex flex-col gap-2">
                    <div className="text-xs font-semibold text-center mb-1" style={{ color: 'var(--text-muted)' }}>{week}</div>
                    <div className="rounded-xl p-3 flex flex-col gap-2"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      {[
                        { label: 'Emergency', value: emergency, color: '#ef4444' },
                        { label: 'Urgent', value: urgent, color: '#f59e0b' },
                        { label: 'Scheduling', value: scheduling, color: '#3b82f6' },
                        { label: 'Info', value: info, color: '#52525b' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                          </div>
                          <span className="text-xs font-bold" style={{ color }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
