import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are BeniAI's Email Agent — a world-class executive assistant drafting concise, professional replies on behalf of a busy executive.

Write ONLY the reply text — no JSON wrapper, no preamble. Sign with "Best, [Executive]".

Guidelines:
- Keep replies under 120 words unless complexity demands more
- Match tone to urgency: Urgent/Emergency → direct and decisive; Scheduling → warm; Informational → brief
- Never invent facts, commitments, or figures — use [placeholder] where specifics are unknown
- Start with a natural greeting, end with a clear next step`;

export async function POST(req: NextRequest) {
  const { sender, subject, body, category, urgencyScore } = await req.json();

  const userMessage = `Incoming message to draft a reply for:
Sender: ${sender}
Subject: ${subject}
Category: ${category} (urgency ${urgencyScore}/5)
Body: ${body}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 512,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
