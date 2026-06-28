import { SystemStat } from '@/data/mockData';
import { TrendingUp } from 'lucide-react';

export default function SystemStatsBar({ stats }: { stats: SystemStat[] }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-px"
      style={{ background: 'var(--border)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-1 px-4 py-3"
          style={{ background: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} style={{ color: 'var(--accent-gold)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </span>
            {stat.unit && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {stat.unit}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
