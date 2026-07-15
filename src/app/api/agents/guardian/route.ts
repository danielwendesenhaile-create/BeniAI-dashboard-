import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { parseModelJson } from '@/lib/parseModelJson';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GuardianPayload {
  sender: string;
  subject: string;
  body: string;
  source: string;
}

export interface GuardianResult {
  isEmergency: boolean;
  threatLevel: 'critical' | 'high' | 'medium' | 'none';
  triggers: string[];
  alertMessage: string;
  recommendedAction: string;
  escalateTo: string[];
}

const SYSTEM_PROMPT = `You are BeniAI's Guardian Agent — an emergency detection and escalation system protecting an executive from missing critical communications.

Analyze a message for emergency indicators and output ONLY valid JSON with these fields:
{
  "isEmergency": boolean,
  "threatLevel": "critical" | "high" | "medium" | "none",
  "triggers": ["list of specific phrases or signals that triggered this assessment"],
  "alertMessage": "concise 1-sentence alert for the executive",
  "recommendedAction": "specific immediate action the executive should take",
  "escalateTo": ["roles/people who should be looped in, e.g. 'Legal Counsel', 'CFO', 'Board Chair'"]
}

Emergency triggers to detect:
- Legal: lawsuit, subpoena, cease-and-desist, regulatory investigation, audit
- Financial: fraud, unauthorized transaction, data breach, security incident
- Safety: threat, accident, medical emergency, building evacuation
- Reputational: media crisis, executive misconduct, viral social media incident
- Operational: system-wide outage, data loss, supply chain failure

threatLevel guide:
- critical: requires executive response within 15 minutes
- high: requires response within 1 hour
- medium: important but can wait a few hours
- none: not an emergency (use this if the message doesn't qualify)

If isEmergency is false, escalateTo should be [] and alertMessage/recommendedAction should be "N/A".`;

export async function POST(req: NextRequest) {
  try {
    const payload: GuardianPayload = await req.json();

    const userMessage = `Message to screen for emergencies:
Source: ${payload.source}
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

    const result: GuardianResult = parseModelJson(textBlock.text);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Guardian Agent] error:', err);
    return NextResponse.json({ error: 'Guardian agent failed' }, { status: 500 });
  }
}
