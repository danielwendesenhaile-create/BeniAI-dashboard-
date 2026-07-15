'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockPriorityItems, mockSystemStats, Category, PriorityItem, SystemStat } from '@/data/mockData';
import PriorityCard from './PriorityCard';
import SystemStatsBar from './SystemStatsBar';
import ComposeModal from './ComposeModal';
import { Inbox, Trash2, Plus, RefreshCw, Loader2 } from 'lucide-react';

const filters: (Category | 'All')[] = ['All', 'Emergency', 'Urgent', 'Scheduling', 'Informational'];

export default function PriorityFeed() {
  const [items, setItems] = useState<PriorityItem[]>(mockPriorityItems);
  const [stats, setStats] = useState<SystemStat[]>(mockSystemStats);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const [feedRes, statsRes] = await Promise.all([
        fetch('/api/feed'),
        fetch('/api/stats'),
      ]);
      if (feedRes.ok) {
        const data = await feedRes.json();
        setItems(data.items ?? []);
      }
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
    } catch { /* use mock data as fallback */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const removeItem = async (id: string, status: 'approved' | 'dismissed') => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/feed/${id}`, {
        method: status === 'dismissed' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch { /* fire and forget */ }
  };

  const addItem = (item: PriorityItem) => setItems((prev) => [item, ...prev]);

  async function syncNow() {
    setSyncing(true);
    try {
      const res = await fetch('/api/integrations/sync');
      if (res.ok) {
        const data = await res.json();
        if (data.items?.length > 0) {
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newItems = data.items.filter((i: PriorityItem) => !existingIds.has(i.id));
            return [...newItems, ...prev];
          });
        }
      }
    } catch { /* ignore */ } finally {
      setSyncing(false);
    }
  }

  const filtered = activeFilter === 'All' ? items : items.filter((i) => i.category === activeFilter);

  return (
    <div className="flex flex-col gap-5 py-6 px-4 sm:px-6 max-w-2xl mx-auto w-full">
      {showCompose && (
        <ComposeModal onClose={() => setShowCompose(false)} onItemCreated={addItem} />
      )}

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Priority Feed
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={syncNow}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              title="Sync from integrations"
            >
              {syncing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            </button>
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--accent-gold)', color: '#09090b' }}
            >
              <Plus size={11} />
              Classify
            </button>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', border: '1px solid rgba(212,175,55,0.2)' }}>
              {items.length} pending
            </span>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          AI-classified communications requiring your attention
        </p>
      </div>

      {/* Stats */}
      <SystemStatsBar stats={stats} />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {filters.map((f) => {
          const count = f === 'All' ? items.length : items.filter((i) => i.category === f).length;
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: isActive ? 'rgba(212,175,55,0.15)' : 'var(--bg-surface)',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)',
              }}
            >
              {f}
              {count > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-xs leading-none" style={{ background: isActive ? 'rgba(212,175,55,0.25)' : 'var(--bg-elevated)', color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {items.length > 0 && (
          <button
            onClick={() => setItems([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ml-auto hover:opacity-80"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <Trash2 size={11} />
            Clear All
          </button>
        )}
      </div>

      {/* Cards */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Inbox size={20} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {activeFilter === 'All' ? 'All clear.' : `No ${activeFilter} items.`}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {activeFilter === 'All' ? 'Your feed is empty. Enjoy the silence.' : 'Switch filter to see other items.'}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <PriorityCard
              key={item.id}
              item={item}
              onApprove={(id) => removeItem(id, 'approved')}
              onDismiss={(id) => removeItem(id, 'dismissed')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
