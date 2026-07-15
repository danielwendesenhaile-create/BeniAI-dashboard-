'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import IntegrationsPanel from './IntegrationsPanel';

export default function OnboardingFlow({ name }: { name: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [finishing, setFinishing] = useState(false);
  const firstName = name?.split(' ')[0] ?? 'there';

  async function finish() {
    setFinishing(true);
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--bg-base)' }}>
      <div
        className="w-full max-w-lg rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-gold)' }}>
            <Zap size={16} strokeWidth={2.5} style={{ color: '#09090b' }} />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>BeniAI</span>
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>Step {step + 1} of 2</span>
        </div>

        {step === 0 ? (
          <>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome, {firstName}</h1>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                BeniAI watches Gmail, Slack, and WhatsApp for you, scores what actually needs your attention,
                and drafts replies in your voice. Let&apos;s connect at least one channel to get started.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--accent-gold)', color: '#09090b' }}
            >
              Continue <ArrowRight size={14} />
            </button>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Connect a channel</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Connect at least one — you can add the rest later from Settings.
              </p>
            </div>
            <IntegrationsPanel />
            <button
              onClick={finish}
              disabled={finishing}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--accent-gold)', color: '#09090b' }}
            >
              {finishing ? <><Loader2 size={14} className="animate-spin" /> Finishing…</> : <>Go to dashboard <ArrowRight size={14} /></>}
            </button>
            <button
              onClick={finish}
              disabled={finishing}
              className="text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-50"
              style={{ color: 'var(--text-muted)' }}
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
