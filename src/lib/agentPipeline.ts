import Anthropic from '@anthropic-ai/sdk';
import { PriorityItem } from '@/data/mockData';
import { parseModelJson } from './parseModelJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export interface RawMessage {
  id: string;
  source: 'gmail' | 'whatsapp' | 'slack';
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  threadId?: string;
  channelId?: string;
  phoneNumber?: string;
}

// Run a message through Router → child agent → return PriorityItem (no DB writes — callers handle persistence)
export async function classifyAndDelegate(rawMsg: RawMessage): Promise<PriorityItem> {
  // Gmail/WhatsApp/Slack messages can legitimately have no extractable text body
  // (attachment-only, unusual MIME nesting, etc.) — never send an empty body downstream.
  const msg = { ...rawMsg, body: rawMsg.body?.trim() || '(no message content)' };

  // Step 1: Router
  const routerRes = await fetch(`${base}/api/router`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: msg.id, source: msg.source, sender: msg.sender, subject: msg.subject, body: msg.body }),
  });
  if (!routerRes.ok) throw new Error(`Router failed: ${routerRes.status}`);
  const router = await routerRes.json();

  let draftReply = '';

  if (router.delegateTo === 'email') {
    const emailRes = await fetch(`${base}/api/agents/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: msg.sender, subject: msg.subject, body: msg.body, category: router.category, urgencyScore: router.urgencyScore }),
    });
    if (emailRes.ok) {
      const email = await emailRes.json();
      draftReply = email.draft;
    }
  } else if (router.delegateTo === 'scheduler') {
    const schedRes = await fetch(`${base}/api/agents/scheduler`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: msg.sender, subject: msg.subject, body: msg.body }),
    });
    if (schedRes.ok) {
      const sched = await schedRes.json();
      draftReply = sched.suggestedReply;
    }
  } else if (router.delegateTo === 'guardian') {
    const guardRes = await fetch(`${base}/api/agents/guardian`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: msg.sender, subject: msg.subject, body: msg.body, source: msg.source }),
    });
    if (guardRes.ok) {
      const guard = await guardRes.json();
      draftReply = guard.isEmergency
        ? `⚠️ ALERT: ${guard.alertMessage}\n\nAction: ${guard.recommendedAction}\n\nEscalate to: ${guard.escalateTo.join(', ')}`
        : `Guardian cleared. Category: ${router.category}`;
    }
  } else {
    draftReply = 'No reply needed — informational only.';
  }

  const clampedScore = Math.min(5, Math.max(1, router.urgencyScore)) as 1 | 2 | 3 | 4 | 5;

  return {
    id: msg.id,
    source: msg.source,
    sender: msg.sender,
    subject: msg.subject,
    preview: msg.body.slice(0, 200),
    body: msg.body.slice(0, 4000),
    timestamp: msg.timestamp,
    category: router.category,
    urgencyScore: clampedScore,
    draftReply,
    threadId: msg.threadId,
    channelId: msg.channelId,
    phoneNumber: msg.phoneNumber,
  };
}

// Inline router (used by webhook routes that can't do HTTP round-trips cleanly)
export async function classifyMessage(params: {
  id: string; source: string; sender: string; subject: string; body: string;
}) {
  const ROUTER_PROMPT = `You are BeniAI's Router Agent. Given a message, output ONLY valid JSON:
{"category":"Emergency"|"Urgent"|"Scheduling"|"Informational","urgencyScore":1-5,"delegateTo":"guardian"|"email"|"scheduler"|null,"reasoning":"one sentence"}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 256,
    thinking: { type: 'adaptive' },
    system: ROUTER_PROMPT,
    messages: [{ role: 'user', content: `Source:${params.source}\nSender:${params.sender}\nSubject:${params.subject}\nBody:${params.body}` }],
  });
  const res = await stream.finalMessage();
  const text = res.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No router response');
  return parseModelJson(text.text);
}
