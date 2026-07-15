'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mail, CalendarDays, Users, Settings, Zap, Hash, BarChart3, Shield, User, Loader2, ArrowRight } from 'lucide-react';

const PAGE_ICON: Record<string, React.ElementType> = {
  briefing: Zap, analytics: BarChart3, calendar: CalendarDays,
  contacts: Users, integrations: Hash, settings: Settings, audit: Shield, profile: User,
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ type: string; id: string; title: string; sub: string; href: string; category?: string; icon?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setResults([]); }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const { results: r } = await res.json();
      setResults(r ?? []);
      setCursor(0);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && results[cursor]) navigate(results[cursor].href);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, cursor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={() => setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          {loading ? <Loader2 size={15} className="animate-spin flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            : <Search size={15} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, contacts, pages…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query.length >= 2 && !loading && (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{query}"</div>
          )}
          {results.length === 0 && query.length < 2 && (
            <div className="px-4 py-4 flex flex-col gap-1">
              <p className="text-xs font-semibold mb-2 px-2" style={{ color: 'var(--text-muted)' }}>Quick Navigate</p>
              {[
                { title: 'Morning Briefing', href: '/briefing', icon: Zap },
                { title: 'Priority Feed', href: '/feed', icon: Mail },
                { title: 'Analytics', href: '/analytics', icon: BarChart3 },
                { title: 'Calendar', href: '/calendar', icon: CalendarDays },
                { title: 'Audit Log', href: '/audit', icon: Shield },
              ].map(({ title, href, icon: Icon }) => (
                <button key={href} onClick={() => navigate(href)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                  {title}
                  <ArrowRight size={11} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          )}
          {results.map((r, i) => {
            const Icon = r.type === 'page' && r.icon ? (PAGE_ICON[r.icon] ?? Zap) : r.type === 'message' ? Mail : Zap;
            const catColor: Record<string, string> = { Emergency: '#ef4444', Urgent: '#f59e0b', Scheduling: '#3b82f6', Informational: '#52525b' };
            return (
              <button key={r.id} onClick={() => navigate(r.href)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                style={{ background: i === cursor ? 'rgba(212,175,55,0.08)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <Icon size={13} style={{ color: 'var(--accent-gold)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.sub}</div>
                </div>
                {r.category && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${catColor[r.category] ?? '#52525b'}15`, color: catColor[r.category] ?? '#52525b' }}>
                    {r.category}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 flex items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['esc', 'Close']].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{key}</kbd>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
