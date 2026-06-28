import { RouterPayload, RouterResult } from '@/app/api/router/route';
import { EmailAgentPayload, EmailAgentResult } from '@/app/api/agents/email/route';
import { SchedulerPayload, SchedulerResult } from '@/app/api/agents/scheduler/route';
import { GuardianPayload, GuardianResult } from '@/app/api/agents/guardian/route';

export async function classifyMessage(payload: RouterPayload): Promise<RouterResult> {
  const res = await fetch('/api/router', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Router failed: ${res.status}`);
  return res.json();
}

export async function draftEmail(payload: EmailAgentPayload): Promise<EmailAgentResult> {
  const res = await fetch('/api/agents/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Email agent failed: ${res.status}`);
  return res.json();
}

export async function parseSchedule(payload: SchedulerPayload): Promise<SchedulerResult> {
  const res = await fetch('/api/agents/scheduler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Scheduler agent failed: ${res.status}`);
  return res.json();
}

export async function checkGuardian(payload: GuardianPayload): Promise<GuardianResult> {
  const res = await fetch('/api/agents/guardian', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Guardian agent failed: ${res.status}`);
  return res.json();
}
