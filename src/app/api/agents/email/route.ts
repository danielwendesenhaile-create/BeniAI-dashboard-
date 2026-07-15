import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { parseModelJson } from '@/lib/parseModelJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface EmailAgentPayload {
  sender: string;
  subject: string;
  body: string;
  category: string;
  urgencyScore: number;
}

export interface EmailAgentResult {
  draft: string;
  tone: 'formal' | 'friendly' | 'urgent';
  suggestedSendTime: string;
}

const SYSTEM_PROMPT = `You are BeniAI's Email Agent — a world-class executive assistant who drafts concise, professional replies on behalf of a busy executive.

Given an incoming message's details, output ONLY valid JSON with these fields:
{
  "draft": "the full reply text, signed 'Best, [Executive]'",
  "tone": "formal" | "friendly" | "urgent",
  "suggestedSendTime": "immediately" | "within 1 hour" | "end of day" | "tomorrow morning"
}

Guidelines:
- Keep drafts under 120 words unless complexity demands more
- Match tone to urgency: Urgent/Emergency → direct and decisive; Scheduling → warm and collaborative; Informational → brief acknowledgement
- Never make up facts, commitments, or figures — use placeholders like [time] or [amount] where specifics are unknown
- Start with a natural greeting, end with a clear next step or close`;

export async function POST(req: NextRequest) {
  try {
    const payload: EmailAgentPayload = await req.json();

    const userMessage = `Incoming message to draft a reply for:
Sender: ${payload.sender}
Subject: ${payload.subject}
Category: ${payload.category} (urgency ${payload.urgencyScore}/5)
Body: ${payload.body}`;

    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from model' }, { status: 500 });
    }

    const result: EmailAgentResult = parseModelJson(textBlock.text);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Email Agent] error:', err);
    return NextResponse.json({ error: 'Email agent failed' }, { status: 500 });
  }
}
