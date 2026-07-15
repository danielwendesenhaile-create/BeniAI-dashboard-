'use client';

import { useState } from 'react';
import LeftNav from '@/components/LeftNav';
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  Users, Video, Zap, CalendarDays, MoreHorizontal,
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

interface CalEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'meeting' | 'call' | 'focus' | 'deadline';
  attendees?: string[];
  location?: string;
  color: string;
  day: number;
  aiNote?: string;
}

const EVENTS: CalEvent[] = [
  { id: 'e1', title: 'LP Quarterly Review', time: '10:00 AM', duration: '3h', type: 'meeting', attendees: ['Marcus Webb', 'Sophia Chen', '+4'], location: 'Board Room A', color: '#d4af37', day: 15, aiNote: 'Prepare Q2 deck before this.' },
  { id: 'e2', title: 'Series B — Legal Sync', time: '2:00 PM', duration: '45m', type: 'call', attendees: ['Jennifer Liu', 'David Park'], color: '#ef4444', day: 15, aiNote: 'Guardian flagged legal risk — review clause 7.2.' },
  { id: 'e3', title: 'Deep Work Block', time: '7:00 AM', duration: '2h', type: 'focus', color: '#3b82f6', day: 16 },
  { id: 'e4', title: 'Coffee — James Okafor', time: '9:30 AM', duration: '30m', type: 'meeting', attendees: ['James Okafor'], location: 'Blue Bottle, FiDi', color: '#22c55e', day: 17 },
  { id: 'e5', title: 'Product Roadmap Review', time: '2:00 PM', duration: '2h', type: 'meeting', attendees: ['Priya Nair', 'Lena Richter', '+6'], color: '#a855f7', day: 18, aiNote: 'Rescheduled from Thursday — conflict with LP.' },
  { id: 'e6', title: 'Investor Roadshow Prep', time: '9:00 AM', duration: '4h', type: 'focus', color: '#f59e0b', day: 19 },
  { id: 'e7', title: 'All-hands — Acme Announcement', time: '4:00 PM', duration: '1h', type: 'call', attendees: ['All Team'], color: '#d4af37', day: 19, aiNote: 'Mention Acme $240K ARR win.' },
  { id: 'e8', title: 'Q3 Exec Offsite Kick-off', time: '8:00 AM', duration: '3d', type: 'deadline', color: '#ef4444', day: 21 },
];

const TYPE_ICONS: Record<CalEvent['type'], React.ElementType> = {
  meeting: Users,
  call: Video,
  focus: Clock,
  deadline: CalendarDays,
};

export default function CalendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState<number>(now.getDate());
  const [view, setView] = useState<'month' | 'week'>('month');

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const selectedEvents = EVENTS.filter((e) => e.day === selected);

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto flex flex-col lg:flex-row gap-0">

        {/* ── Calendar grid ── */}
        <div className="flex-1 px-6 py-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Managed by BeniAI Scheduler Agent
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {(['month', 'week'] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    className="px-3 py-1.5 text-xs font-medium capitalize transition-all"
                    style={{
                      background: view === v ? 'var(--accent-gold)' : 'var(--bg-elevated)',
                      color: view === v ? '#09090b' : 'var(--text-muted)',
                    }}>
                    {v}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--accent-gold)', color: '#09090b' }}>
                <Plus size={13} /> New Event
              </button>
            </div>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-4">
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <ChevronLeft size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
            <span className="text-base font-bold flex-1 text-center" style={{ color: 'var(--text-primary)' }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const evs = EVENTS.filter((e) => e.day === day);
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
              const isSel = day === selected;
              return (
                <div
                  key={day}
                  onClick={() => setSelected(day)}
                  className="min-h-[72px] rounded-xl p-2 cursor-pointer transition-all flex flex-col gap-1"
                  style={{
                    background: isSel ? 'rgba(212,175,55,0.12)' : 'var(--bg-surface)',
                    border: isSel ? '1px solid rgba(212,175,55,0.4)' : isToday ? '1px solid rgba(212,175,55,0.25)' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold self-end"
                    style={{
                      background: isToday ? 'var(--accent-gold)' : 'transparent',
                      color: isToday ? '#09090b' : isSel ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    }}>
                    {day}
                  </div>
                  {evs.slice(0, 2).map((ev) => (
                    <div key={ev.id} className="text-xs px-1.5 py-0.5 rounded truncate font-medium"
                      style={{ background: `${ev.color}20`, color: ev.color }}>
                      {ev.title}
                    </div>
                  ))}
                  {evs.length > 2 && (
                    <div className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>+{evs.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Day detail panel ── */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l flex flex-col" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} style={{ color: 'var(--accent-gold)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {MONTHS[month]} {selected}
              </span>
            </div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} scheduled
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <CalendarDays size={32} style={{ color: 'var(--border)' }} />
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  No events — BeniAI will auto-book<br />scheduling requests here.
                </p>
              </div>
            ) : selectedEvents.map((ev) => {
              const Icon = TYPE_ICONS[ev.type];
              return (
                <div key={ev.id} className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: 'var(--bg-elevated)', border: `1px solid ${ev.color}30` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}30` }}>
                      <Icon size={16} style={{ color: ev.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{ev.time} · {ev.duration}</div>
                    </div>
                    <button className="opacity-40 hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>

                  {ev.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ev.location}</span>
                    </div>
                  )}

                  {ev.attendees && (
                    <div className="flex items-center gap-2">
                      <Users size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ev.attendees.join(', ')}</span>
                    </div>
                  )}

                  {ev.aiNote && (
                    <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
                      style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)' }}>
                      <Zap size={11} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent-gold)' }} />
                      <span className="text-xs" style={{ color: 'var(--accent-gold)' }}>{ev.aiNote}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
