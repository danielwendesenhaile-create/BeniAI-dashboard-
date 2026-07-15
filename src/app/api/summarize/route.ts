import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, type = 'thread' } = await req.json();
    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

    const prompts = {
      thread: 'Summarise this email thread in 2-3 sentences. Focus on: what decision or action is needed, from whom, and by when.',
      meeting: 'Extract from this meeting transcript: 1) Key decisions made, 2) Action items with owners, 3) Any open questions. Be concise and executive-level.',
      message: 'Summarise this message in one sentence. State what it is asking for and who needs to act.',
    };

    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 300,
      thinking: { type: 'adaptive' },
      system: prompts[type as keyof typeof prompts] ?? prompts.thread,
      messages: [{ role: 'user', content: text }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    return NextResponse.json({ summary: textBlock?.type === 'text' ? textBlock.text : '' });
  } catch (err) {
    console.error('[Summarize]', err);
    return NextResponse.json({ error: 'Summarization failed' }, { status: 500 });
  }
}
