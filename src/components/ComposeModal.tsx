'use client';

import { useState } from 'react';
import { X, Zap, Mail, MessageCircle, Hash, Loader2 } from 'lucide-react';
import { classifyMessage, parseSchedule, checkGuardian } from '@/lib/beniApi';
import { PriorityItem } from '@/data/mockData';
import { useAgentLog } from '@/context/AgentLogContext';

interface Props {
  onClose: () => void;
  onItemCreated: (item: PriorityItem) => void;
}

const sources = [
  { id: 'gmail', label: 'Gmail', icon: Mail, color: '#ef4444' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#22c55e' },
  { id: 'slack', label: 'Slack', icon: Hash, color: '#a855f7' },
] as const;

type Source = typeof sources[number]['id'];

export default function ComposeModal({ onClose, onItemCreated }: Props) {
  const { pushLog } = useAgentLog();
  const [source, setSource] = useState<Source>('gmail');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'routing' | 'drafting' | 'done' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');
  const [streamedDraft, setStreamedDraft] = useState('');

  const isLoading = status === 'routing' || status === 'drafting';

  async function handleClassify() {
    if (!sender.trim() || !subject.trim() || !body.trim()) return;
    setStreamedDraft('');

    try {
      setStatus('routing');
      setStatusText('Router Agent classifying…');

      const id = `live-${Date.now()}`;
      const routerResult = await classifyMessage({ id, source, sender, subject, body });
      pushLog('Router', `${source} → ${routerResult.category} (score ${routerResult.urgencyScore}) → delegating to ${routerResult.delegateTo ?? 'none'}`);

      setStatus('drafting');
      let draftReply = '';

      if (routerResult.delegateTo === 'guardian') {
        setStatusText('Guardian Agent scanning for threats…');
        const guardianResult = await checkGuardian({ sender, subject, body, source });
        if (guardianResult.isEmergency) {
          pushLog('Guardian', `⚠️ ${guardianResult.threatLevel.toUpperCase()}: ${guardianResult.alertMessage}`);
          draftReply = `⚠️ ALERT: ${guardianResult.alertMessage}\n\nRecommended action: ${guardianResult.recommendedAction}\n\nEscalate to: ${guardianResult.escalateTo.join(', ')}`;
        } else {
          pushLog('Guardian', `Scan complete — no emergency detected. Category: ${routerResult.category}`);
          draftReply = `Guardian cleared this message. No emergency detected.\nClassified as: ${routerResult.category}`;
        }

      } else if (routerResult.delegateTo === 'scheduler') {
        setStatusText('Scheduler Agent parsing calendar request…');
        const schedulerResult = await parseSchedule({ sender, subject, body });
        pushLog('Scheduler', `${schedulerResult.requestType} → proposed ${schedulerResult.proposedSlots.length} slots (${schedulerResult.duration})`);
        draftReply = schedulerResult.suggestedReply;

      } else if (routerResult.delegateTo === 'email') {
        setStatusText('Email Agent drafting reply…');
        pushLog('Email', `Drafting reply for ${routerResult.category} message from ${sender.split('<')[0].trim()}…`);

        // Stream the draft
        const res = await fetch('/api/agents/email/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender, subject, body, category: routerResult.category, urgencyScore: routerResult.urgencyScore }),
        });

        if (!res.ok || !res.body) throw new Error('Stream failed');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setStreamedDraft(full);
        }

        draftReply = full;
        pushLog('Email', `Draft complete (${draftReply.split(' ').length} words)`);

      } else {
        pushLog('Router', `Informational — no action required`);
        draftReply = 'No reply needed — marked as informational.';
      }

      const clampedScore = Math.min(5, Math.max(1, routerResult.urgencyScore)) as 1 | 2 | 3 | 4 | 5;
      const newItem: PriorityItem = {
        id,
        source,
        sender,
        subject,
        preview: body.slice(0, 200),
        timestamp: 'just now',
        category: routerResult.category,
        urgencyScore: clampedScore,
        draftReply,
      };

      setStatus('done');
      onItemCreated(newItem);
      onClose();
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusText('Classification failed. Check your API key and try again.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Zap size={14} style={{ color: 'var(--accent-gold)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Classify New Message
            </span>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Source selector */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Source</label>
            <div className="flex gap-2">
              {sources.map((s) => {
                const Icon = s.icon;
                const active = source === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSource(s.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: active ? `${s.color}18` : 'var(--bg-elevated)',
                      border: active ? `1px solid ${s.color}50` : '1px solid var(--border)',
                      color: active ? s.color : 'var(--text-muted)',
                    }}
                  >
                    <Icon size={12} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sender */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Sender</label>
            <input
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="name@company.com"
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-dim)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-dim)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Message Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the message content here…"
              rows={4}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none resize-none transition-all"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.75rem',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-dim)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Streaming draft preview */}
          {streamedDraft && (
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--accent-gold)' }}>
                Email Agent — drafting…
              </label>
              <div
                className="text-xs leading-relaxed rounded-lg px-3 py-2.5 whitespace-pre-wrap"
                style={{
                  background: 'rgba(212,175,55,0.05)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-geist-mono)',
                  minHeight: 60,
                }}
              >
                {streamedDraft}
                {isLoading && <span className="animate-pulse ml-0.5" style={{ color: 'var(--accent-gold)' }}>▋</span>}
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {statusText}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleClassify}
            disabled={isLoading || !sender || !subject || !body}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'var(--accent-gold)', color: '#09090b' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {statusText}
              </>
            ) : (
              <>
                <Zap size={13} />
                Run Through Agents
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="text-sm px-4 py-2.5 rounded-lg transition-all hover:bg-white/[0.05]"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
