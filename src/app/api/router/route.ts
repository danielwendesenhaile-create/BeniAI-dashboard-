import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { RouterPayloadSchema } from '@/lib/schemas';
import { log } from '@/lib/logger';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface RouterPayload {
  id: string;
  source: 'gmail' | 'whatsapp' | 'slack';
  sender: string;
  subject: string;
  body: string;
}

export interface RouterResult {
  id: string;
  category: 'Emergency' | 'Urgent' | 'Scheduling' | 'Informational';
  urgencyScore: number; // 1-5
  delegateTo: 'guardian' | 'email' | 'scheduler' | null;
  reasoning: string;
}

const SYSTEM_PROMPT = `You are BeniAI's Router Agent — the first-pass classifier for an executive's incoming communications.

Given a message, output ONLY valid JSON with these fields:
{
  "category": "Emergency" | "Urgent" | "Scheduling" | "Informational",
  "urgencyScore": 1-5,
  "delegateTo": "guardian" | "email" | "scheduler" | null,
  "reasoning": "one-sentence explanation"
}

Classification rules:
- Emergency: life safety, legal crisis, system outage, or anything requiring immediate CEO/exec intervention → delegateTo: "guardian"
- Urgent: time-sensitive business matters needing response within hours → delegateTo: "email"
- Scheduling: meeting requests, calendar coordination, availability queries → delegateTo: "scheduler"
- Informational: newsletters, FYIs, status updates, no action needed → delegateTo: null

urgencyScore scale: 1=low, 5=critical. Emergency items are always 4-5.`;

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = RouterPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
    }
    const payload: RouterPayload = parsed.data;

    const userMessage = `Source: ${payload.source}
Sender: ${payload.sender}
Subject: ${payload.subject}
Body: ${payload.body}`;

    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 512,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from model' }, { status: 500 });
    }

    const classification = JSON.parse(textBlock.text);
    const result: RouterResult = {
      id: payload.id,
      ...classification,
    };

    return NextResponse.json(result);
  } catch (err) {
    log.error('router.failed', err);
    return NextResponse.json({ error: 'Router failed' }, { status: 500 });
  }
}
