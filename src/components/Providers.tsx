'use client';

import { AgentLogProvider } from '@/context/AgentLogContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <AgentLogProvider>{children}</AgentLogProvider>;
}
