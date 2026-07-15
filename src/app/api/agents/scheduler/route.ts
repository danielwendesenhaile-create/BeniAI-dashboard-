import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { parseModelJson } from '@/lib/parseModelJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SchedulerPayload {
  sender: string;
  subject: string;
  body: string;
}

export interface SchedulerResult {
  requestType: 'meeting_request' | 'reschedule' | 'cancellation' | 'availability_check';
  proposedSlots: string[];
  duration: string;
  suggestedReply: string;
  calendarAction: string;
}

const SYSTEM_PROMPT = `You are BeniAI's Scheduler Agent — an expert at parsing calendar requests and proposing optimal meeting slots for a busy executive.

Given a scheduling-related message, output ONLY valid JSON with these fields:
{
  "requestType": "meeting_request" | "reschedule" | "cancellation" | "availability_check",
  "proposedSlots": ["e.g. Tuesday 2pm ET", "Wednesday 10am ET"],
  "duration": "e.g. 30 minutes",
  "suggestedReply": "short reply proposing slots or confirming",
  "calendarAction": "human-readable description of what to add/modify in calendar"
}

Rules:
- Propose exactly 2-3 slots that fit a typical executive schedule (avoid Monday mornings, Friday afternoons)
- Default meeting duration to 30 minutes unless specified
- Keep suggestedReply under 80 words
- If cancellation, propose a reschedule unless the sender says otherwise`;

export async function POST(req: NextRequest) {
  try {
    const payload: SchedulerPayload = await req.json();

    const userMessage = `Scheduling request:
Sender: ${payload.sender}
Subject: ${payload.subject}
Body: ${payload.body}`;

    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 768,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from model' }, { status: 500 });
    }

    const result: SchedulerResult = parseModelJson(textBlock.text);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Scheduler Agent] error:', err);
    return NextResponse.json({ error: 'Scheduler agent failed' }, { status: 500 });
  }
}
