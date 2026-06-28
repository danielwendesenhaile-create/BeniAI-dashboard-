'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { mockAgentLogs, AgentLog } from '@/data/mockData';

interface AgentLogContextValue {
  logs: AgentLog[];
  pushLog: (agent: AgentLog['agent'], message: string) => void;
}

const AgentLogContext = createContext<AgentLogContextValue | null>(null);

export function AgentLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AgentLog[]>(mockAgentLogs);

  const pushLog = useCallback((agent: AgentLog['agent'], message: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const entry: AgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      agent,
      message,
      time,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 50));
  }, []);

  return (
    <AgentLogContext.Provider value={{ logs, pushLog }}>
      {children}
    </AgentLogContext.Provider>
  );
}

export function useAgentLog() {
  const ctx = useContext(AgentLogContext);
  if (!ctx) throw new Error('useAgentLog must be used within AgentLogProvider');
  return ctx;
}
