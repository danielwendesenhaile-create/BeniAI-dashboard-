'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, RefreshCw } from 'lucide-react';

interface AIPrefs {
  executiveName: string;
  signature: string;
  defaultTone: 'formal' | 'friendly' | 'concise';
  maxDraftWords: 80 | 120 | 200;
}

interface NotifPrefs {
  emergencySound: boolean;
  autoSyncInterval: 0 | 5 | 15;
  autoDismissInformational: boolean;
}

const defaultAI: AIPrefs = {
  executiveName: '',
  signature: 'Best regards,\n[Executive]',
  defaultTone: 'formal',
  maxDraftWords: 120,
};

const defaultNotif: NotifPrefs = {
  emergencySound: true,
  autoSyncInterval: 5,
  autoDismissInformational: false,
};

export default function SettingsPanel() {
  const [ai, setAi] = useState<AIPrefs>(defaultAI);
  const [notif, setNotif] = useState<NotifPrefs>(defaultNotif);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const storedAI = localStorage.getItem('beni_ai_prefs');
      const storedNotif = localStorage.getItem('beni_notif_prefs');
      if (storedAI) setAi(JSON.parse(storedAI));
      if (storedNotif) setNotif(JSON.parse(storedNotif));
    } catch { /* ignore */ }
  }, []);

  function save() {
    localStorage.setItem('beni_ai_prefs', JSON.stringify(ai));
    localStorage.setItem('beni_notif_prefs', JSON.stringify(notif));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Personalise BeniAI's behaviour for your workflow</p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--accent-gold)', color: '#09090b' }}
        >
          {saved ? <RefreshCw size={12} /> : <Save size={12} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* AI Preferences */}
      <section className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <Settings size={14} style={{ color: 'var(--accent-gold)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Preferences</span>
        </div>
        <div className="px-5 py-5 flex flex-col gap-5">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Executive Name</label>
            <input
              value={ai.executiveName}
              onChange={(e) => setAi((a) => ({ ...a, executiveName: e.target.value }))}
              placeholder="e.g. Sarah Chen"
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-dim)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Used to personalise draft signatures and greetings</p>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Email Signature</label>
            <textarea
              value={ai.signature}
              onChange={(e) => setAi((a) => ({ ...a, signature: e.target.value }))}
              rows={3}
              className="w-full text-xs rounded-lg px-3 py-2.5 outline-none resize-none transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-dim)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Default Reply Tone</label>
            <div className="flex gap-2">
              {(['formal', 'friendly', 'concise'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setAi((a) => ({ ...a, defaultTone: tone }))}
                  className="px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: ai.defaultTone === tone ? 'rgba(212,175,55,0.15)' : 'var(--bg-elevated)',
                    color: ai.defaultTone === tone ? 'var(--accent-gold)' : 'var(--text-muted)',
                    border: ai.defaultTone === tone ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)',
                  }}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Max Draft Length</label>
            <div className="flex gap-2">
              {([80, 120, 200] as const).map((words) => (
                <button
                  key={words}
                  onClick={() => setAi((a) => ({ ...a, maxDraftWords: words }))}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: ai.maxDraftWords === words ? 'rgba(212,175,55,0.15)' : 'var(--bg-elevated)',
                    color: ai.maxDraftWords === words ? 'var(--accent-gold)' : 'var(--text-muted)',
                    border: ai.maxDraftWords === words ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)',
                  }}
                >
                  {words} words
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications & Sync</span>
        </div>
        <div className="px-5 py-5 flex flex-col gap-5">
          {[
            { key: 'emergencySound', label: 'Emergency alert sound', desc: 'Play audio for Emergency-category items' },
            { key: 'autoDismissInformational', label: 'Auto-dismiss Informational', desc: 'Automatically remove low-priority FYI messages' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</div>
              </div>
              <button
                onClick={() => setNotif((n) => ({ ...n, [key]: !n[key as keyof NotifPrefs] }))}
                className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                style={{ background: notif[key as keyof NotifPrefs] ? 'var(--accent-gold)' : 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  style={{
                    background: '#fff',
                    left: notif[key as keyof NotifPrefs] ? '20px' : '2px',
                  }}
                />
              </button>
            </div>
          ))}

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Auto-Sync Interval</label>
            <div className="flex gap-2">
              {([0, 5, 15] as const).map((mins) => (
                <button
                  key={mins}
                  onClick={() => setNotif((n) => ({ ...n, autoSyncInterval: mins }))}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: notif.autoSyncInterval === mins ? 'rgba(212,175,55,0.15)' : 'var(--bg-elevated)',
                    color: notif.autoSyncInterval === mins ? 'var(--accent-gold)' : 'var(--text-muted)',
                    border: notif.autoSyncInterval === mins ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border)',
                  }}
                >
                  {mins === 0 ? 'Off' : `${mins} min`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
          <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>Danger Zone</span>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {[
            { label: 'Disconnect Gmail', path: '/api/integrations/gmail/sync', method: 'DELETE' },
            { label: 'Disconnect Slack', path: '/api/integrations/slack/connect', method: 'DELETE' },
            { label: 'Disconnect WhatsApp', path: '/api/integrations/whatsapp/connect', method: 'DELETE' },
          ].map(({ label, path, method }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <button
                onClick={() => fetch(path, { method }).catch(() => {})}
                className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]"
                style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
