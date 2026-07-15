'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Hash, X, ChevronDown, ChevronUp, AlertTriangle, Loader2, Send, FileText, Clock, Share2 } from 'lucide-react';
import { PriorityItem } from '@/data/mockData';
import { useAgentLog } from '@/context/AgentLogContext';

const sourceConfig = {
  gmail: { icon: Mail, color: '#ef4444', label: 'Gmail' },
  whatsapp: { icon: MessageCircle, color: '#22c55e', label: 'WhatsApp' },
  slack: { icon: Hash, color: '#a855f7', label: 'Slack' },
};

const categoryConfig = {
  Emergency: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)', pulse: true },
  Urgent: { bg: 'rgba(239,68,68,0.08)', color: '#f97316', border: 'rgba(249,115,22,0.3)', pulse: false },
  Scheduling: { bg: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)', pulse: false },
  Informational: { bg: 'rgba(113,113,122,0.1)', color: '#a1a1aa', border: 'rgba(113,113,122,0.2)', pulse: false },
};

interface Props {
  item: PriorityItem;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

function extractEmail(sender: string): string {
  const match = sender.match(/<(.+?)>/);
  return match ? match[1] : sender;
}

export default function PriorityCard({ item, onApprove, onDismiss }: Props) {
  const { pushLog } = useAgentLog();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(item.draftReply);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [tldr, setTldr] = useState<string | null>(null);
  const [tldrLoading, setTldrLoading] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showDelegate, setShowDelegate] = useState(false);
  const [delegateTo, setDelegateTo] = useState('Priya Nair');
  const [delegateNote, setDelegateNote] = useState('');
  const [delegated, setDelegated] = useState(false);

  async function handleTldr() {
    if (tldr) { setTldr(null); return; }
    setTldrLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item.preview, type: 'message' }),
      });
      const { summary } = await res.json();
      setTldr(summary ?? 'Could not summarize.');
    } catch { setTldr('Could not summarize.'); }
    setTldrLoading(false);
  }

  function handleSnooze(minutes: number) {
    setShowSnooze(false);
    setSnoozed(true);
    pushLog('Guardian', `Snoozed "${item.subject}" for ${minutes} minutes`);
    setTimeout(() => setSnoozed(false), minutes * 60 * 1000);
  }

  function handleDelegate() {
    setShowDelegate(false);
    setDelegated(true);
    pushLog('Email', `Forwarded "${item.subject}" to ${delegateTo}${delegateNote ? ' with context' : ''}`);
    setTimeout(() => onDismiss(item.id), 800);
  }

  const src = sourceConfig[item.source];
  const cat = categoryConfig[item.category];
  const SrcIcon = src.icon;

  async function handleApprove() {
    setSendError(null);
    setSending(true);

    try {
      let endpoint = '';
      let body: Record<string, unknown> = {};

      if (item.source === 'gmail') {
        const to = item.replyTo ?? extractEmail(item.sender);
        endpoint = '/api/send/gmail';
        body = { to, subject: `Re: ${item.subject}`, body: draft, threadId: item.threadId };
      } else if (item.source === 'slack') {
        const channel = item.channelId ?? item.sender.split('·')[1]?.trim().replace('#', '') ?? 'general';
        endpoint = '/api/send/slack';
        body = { channel, text: draft };
      } else if (item.source === 'whatsapp') {
        const to = item.phoneNumber ?? extractEmail(item.sender);
        endpoint = '/api/send/whatsapp';
        body = { to, text: draft };
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? 'Send failed');
        }

        pushLog(item.source === 'slack' ? 'Email' : 'Email', `Sent reply to ${item.sender.split('<')[0].trim()} via ${src.label}`);
      }

      onApprove(item.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Send failed';
      setSendError(msg);
      setSending(false);
    }
  }

  if (snoozed) {
    return (
      <div className="rounded-xl px-4 py-3 flex items-center gap-3 opacity-50"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <Clock size={13} style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Snoozed — "{item.subject}"</span>
        <button onClick={() => setSnoozed(false)} className="ml-auto text-xs" style={{ color: 'var(--accent-gold)' }}>Wake</button>
      </div>
    );
  }

  if (delegated) {
    return (
      <div className="rounded-xl px-4 py-3 flex items-center gap-3 opacity-60"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <Share2 size={13} style={{ color: '#22c55e' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Delegated to {delegateTo}</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${item.category === 'Emergency' ? 'rgba(239,68,68,0.35)' : 'var(--border)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5"
          style={{ background: `${src.color}18`, border: `1px solid ${src.color}30` }}
        >
          <SrcIcon size={14} style={{ color: src.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cat.pulse ? 'pulse-urgent' : ''}`}
              style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
            >
              {item.category === 'Emergency' && <AlertTriangle size={10} />}
              {item.category}
            </span>

            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: dot <= item.urgencyScore
                      ? item.urgencyScore >= 4 ? '#ef4444' : item.urgencyScore === 3 ? '#f97316' : '#d4af37'
                      : 'var(--border)',
                  }}
                />
              ))}
            </div>

            <span className="ml-auto text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {item.timestamp}
            </span>
          </div>

          <div className="text-xs mb-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {item.sender}
          </div>
          <div className="text-sm font-semibold mb-1 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {item.subject}
          </div>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {item.preview}
          </p>

          {/* TL;DR */}
          {tldr && (
            <div className="mt-2 px-3 py-2 rounded-lg text-xs leading-relaxed"
              style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)', color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--accent-gold)' }}>TL;DR · </span>{tldr}
            </div>
          )}

          {/* Quick actions row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button onClick={handleTldr} disabled={tldrLoading}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {tldrLoading ? <Loader2 size={10} className="animate-spin" /> : <FileText size={10} />}
              {tldr ? 'Hide TL;DR' : 'TL;DR'}
            </button>
            <button onClick={() => setShowSnooze(!showSnooze)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <Clock size={10} /> Snooze
            </button>
            <button onClick={() => setShowDelegate(!showDelegate)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all hover:opacity-80"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <Share2 size={10} /> Delegate
            </button>
          </div>

          {/* Snooze picker */}
          {showSnooze && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {[15, 60, 240, 1440].map((m) => (
                <button key={m} onClick={() => handleSnooze(m)}
                  className="px-2.5 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                  style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  {m < 60 ? `${m}m` : m < 1440 ? `${m / 60}h` : '1d'}
                </button>
              ))}
              <button onClick={() => setShowSnooze(false)} className="text-xs" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          )}

          {/* Delegate form */}
          {showDelegate && (
            <div className="mt-2 p-3 rounded-xl flex flex-col gap-2"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Forward to:</span>
                <select value={delegateTo} onChange={(e) => setDelegateTo(e.target.value)}
                  className="flex-1 text-xs px-2 py-1 rounded-lg outline-none"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <option>Priya Nair</option>
                  <option>Jordan Lee</option>
                  <option>Alex Martinez</option>
                  <option>Sam Chen</option>
                </select>
              </div>
              <input value={delegateNote} onChange={(e) => setDelegateNote(e.target.value)}
                placeholder="Add context (optional)…"
                className="text-xs px-2.5 py-1.5 rounded-lg outline-none w-full"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              <div className="flex gap-2">
                <button onClick={handleDelegate}
                  className="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--accent-gold)', color: '#09090b' }}>
                  Forward
                </button>
                <button onClick={() => setShowDelegate(false)} className="text-xs px-3" style={{ color: 'var(--text-muted)' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message + Draft Reply toggle */}
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium transition-colors hover:bg-white/[0.02]"
          style={{ color: 'var(--accent-gold)' }}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Hide message & draft reply' : 'Read message & review AI draft'}
        </button>

        {expanded && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Original message
              </div>
              <div
                className="w-full text-xs leading-relaxed rounded-lg px-3 py-2.5 whitespace-pre-wrap"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}
              >
                {item.body || item.preview || '(no message content)'}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--accent-gold)' }}>
                AI draft reply — edit before sending
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                className="w-full text-xs leading-relaxed resize-none rounded-lg px-3 py-2.5 outline-none focus:ring-1 transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-geist-mono)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold-dim)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {sendError && (
              <p className="text-xs px-2 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {sendError}
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleApprove}
                disabled={sending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--accent-gold)', color: '#09090b' }}
              >
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {sending ? 'Sending…' : 'Approve & Send'}
              </button>
              <button
                onClick={() => onDismiss(item.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-white/[0.05]"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <X size={12} />
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!expanded && (
          <div className="flex items-center gap-2 px-4 pb-3">
            <button
              onClick={() => onDismiss(item.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white/[0.05]"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <X size={11} />
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
