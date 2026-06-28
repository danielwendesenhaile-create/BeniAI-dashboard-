import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { PriorityItem } from '@/data/mockData';

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

async function persistLog(agent: string, message: string) {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  try {
    await db.agentLog.create({ data: { agent, message, time } });
  } catch { /* non-critical */ }
}

async function incrementStat(field: 'messagesFiltered' | 'draftsGenerated' | 'meetingsBlocked' | 'alertsFired') {
  try {
    await db.stats.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', [field]: 1 },
      update: { [field]: { increment: 1 } },
    });
  } catch { /* non-critical */ }
}

// Run a message through Router → child agent → persist → return PriorityItem
export async function classifyAndDelegate(msg: RawMessage): Promise<PriorityItem> {
  // Step 1: Router
  const routerRes = await fetch(`${base}/api/router`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: msg.id, source: msg.source, sender: msg.sender, subject: msg.subject, body: msg.body }),
  });
  if (!routerRes.ok) throw new Error(`Router failed: ${routerRes.status}`);
  const router = await routerRes.json();

  await persistLog('Router', `${msg.source} → ${router.category} (score ${router.urgencyScore}) → ${router.delegateTo ?? 'none'}`);
  await incrementStat('messagesFiltered');

  let draftReply = '';

  // Step 2: Delegate to child agent
  if (router.delegateTo === 'email') {
    const emailRes = await fetch(`${base}/api/agents/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: msg.sender, subject: msg.subject, body: msg.body, category: router.category, urgencyScore: router.urgencyScore }),
    });
    if (emailRes.ok) {
      const email = await emailRes.json();
      draftReply = email.draft;
      await persistLog('Email', `Draft complete for "${msg.subject.slice(0, 50)}" (${router.category})`);
      await incrementStat('draftsGenerated');
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
      await persistLog('Scheduler', `${sched.requestType} → ${sched.proposedSlots.length} slots (${sched.duration})`);
      await incrementStat('meetingsBlocked');
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
      await persistLog('Guardian', guard.isEmergency ? `⚠️ ${guard.threatLevel.toUpperCase()}: ${guard.alertMessage}` : `Cleared — no emergency`);
      if (guard.isEmergency) await incrementStat('alertsFired');
    }
  } else {
    draftReply = 'No reply needed — informational only.';
  }

  const clampedScore = Math.min(5, Math.max(1, router.urgencyScore)) as 1 | 2 | 3 | 4 | 5;
  const item: PriorityItem = {
    id: msg.id,
    source: msg.source,
    sender: msg.sender,
    subject: msg.subject,
    preview: msg.body.slice(0, 200),
    timestamp: msg.timestamp,
    category: router.category,
    urgencyScore: clampedScore,
    draftReply,
    threadId: msg.threadId,
    channelId: msg.channelId,
    phoneNumber: msg.phoneNumber,
  };

  // Persist to DB
  try {
    await db.priorityItem.upsert({
      where: { id: item.id },
      create: { ...item, body: msg.body, status: 'pending' },
      update: { draftReply, category: router.category, urgencyScore: clampedScore },
    });
  } catch { /* non-critical */ }

  return item;
}

// Inline router for server-to-server (no HTTP round-trip needed)
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
  return JSON.parse(text.text);
}
