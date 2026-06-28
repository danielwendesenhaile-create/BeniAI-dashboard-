'use client';

import { mockPriorityItems } from '@/data/mockData';
import { useAgentLog } from '@/context/AgentLogContext';
import { Bot, ShieldAlert, Activity } from 'lucide-react';

const agentColors: Record<string, string> = {
  Router: '#d4af37',
  Guardian: '#ef4444',
  Email: '#3b82f6',
  Scheduler: '#22c55e',
};

export default function RightDrawer() {
  const { logs } = useAgentLog();
  const emergencies = mockPriorityItems.filter((i) => i.category === 'Emergency');

  return (
    <aside
      className="hidden lg:flex flex-col h-full sticky top-0 overflow-y-auto"
      style={{
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        width: 300,
      }}
    >
      {/* Guardian Alerts */}
      {emergencies.length > 0 && (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 px-4 py-3">
            <ShieldAlert size={13} style={{ color: '#ef4444' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#ef4444' }}>
              Guardian Alerts
            </span>
            <span
              className="ml-auto text-xs px-1.5 py-0.5 rounded-full pulse-urgent"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {emergencies.length}
            </span>
          </div>
          <div className="px-4 pb-4 flex flex-col gap-2">
            {emergencies.map((e) => (
              <div
                key={e.id}
                className="rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <div className="text-xs font-semibold mb-0.5" style={{ color: '#ef4444' }}>
                  {e.subject}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {e.preview.slice(0, 90)}…
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Logs header */}
      <div
        className="flex items-center gap-2 px-4 py-3 sticky top-0"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          zIndex: 10,
        }}
      >
        <Activity size={13} style={{ color: 'var(--accent-gold)' }} />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Agent Logs
        </span>
        <span
          className="ml-auto w-2 h-2 rounded-full"
          style={{ background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }}
          title="Live"
        />
      </div>

      {/* Logs */}
      <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {logs.map((log) => (
          <div key={log.id} className="px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Bot size={11} style={{ color: agentColors[log.agent] ?? 'var(--text-muted)', flexShrink: 0 }} />
              <span className="text-xs font-semibold" style={{ color: agentColors[log.agent] ?? 'var(--text-muted)' }}>
                {log.agent}
              </span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                {log.time}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono)', fontSize: '0.68rem' }}>
              {log.message}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
