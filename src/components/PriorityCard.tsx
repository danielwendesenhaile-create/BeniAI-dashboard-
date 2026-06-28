'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Hash, CheckCheck, X, ChevronDown, ChevronUp, AlertTriangle, Loader2, Send } from 'lucide-react';
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
        </div>
      </div>

      {/* Draft Reply toggle */}
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium transition-colors hover:bg-white/[0.02]"
          style={{ color: 'var(--accent-gold)' }}
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Hide draft reply' : 'View AI draft reply'}
        </button>

        {expanded && (
          <div className="px-4 pb-4">
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

            {sendError && (
              <p className="text-xs mt-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {sendError}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
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
              onClick={handleApprove}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent-gold)', color: '#09090b' }}
            >
              {sending ? <Loader2 size={11} className="animate-spin" /> : <CheckCheck size={11} />}
              {sending ? 'Sending…' : 'Approve'}
            </button>
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
