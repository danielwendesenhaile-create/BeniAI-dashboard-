import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { mockPriorityItems, mockAgentLogs } from '@/data/mockData';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  try {
    const emergencies = mockPriorityItems.filter((i) => i.category === 'Emergency');
    const urgent = mockPriorityItems.filter((i) => i.category === 'Urgent');
    const scheduling = mockPriorityItems.filter((i) => i.category === 'Scheduling');

    const context = `
Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

Inbox summary:
- ${emergencies.length} Emergency items: ${emergencies.map((i) => i.subject).join(', ')}
- ${urgent.length} Urgent items: ${urgent.map((i) => i.subject).join(', ')}
- ${scheduling.length} Scheduling items: ${scheduling.map((i) => i.subject).join(', ')}

Top priority item: ${mockPriorityItems[0]?.subject} from ${mockPriorityItems[0]?.sender}

Agent activity (last 3): ${mockAgentLogs.slice(0, 3).map((l) => l.message).join(' | ')}
    `.trim();

    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 600,
      thinking: { type: 'adaptive' },
      system: `You are BeniAI, an executive personal assistant. Generate a concise morning briefing for a CEO/entrepreneur.
Return a JSON object with these exact fields:
{
  "greeting": "one warm sentence with the date",
  "headline": "one-sentence summary of the most critical thing today",
  "priorities": ["max 3 bullet strings, most important first"],
  "watchOut": "one sentence about the biggest risk today",
  "aiInsight": "one strategic observation or recommendation based on the pattern of today's messages",
  "mood": "calm | busy | critical"
}
Be direct, executive-level, no fluff.`,
      messages: [{ role: 'user', content: context }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('No response');

    const json = JSON.parse(textBlock.text.replace(/```json\n?|\n?```/g, '').trim());
    return NextResponse.json(json);
  } catch (err) {
    console.error('[Briefing]', err);
    return NextResponse.json({
      greeting: `Good morning — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
      headline: 'Series B term sheet expires at 5PM — your countersignature is the critical path item.',
      priorities: [
        'Sign Series B term sheet before 5PM (Marcus Webb)',
        'EU production rollback needs your authorization call at 9:45',
        'Board deck sign-off on slide 12 before noon upload',
      ],
      watchOut: 'Legal flagged clause 7.2 in the term sheet — confirm anti-dilution formula before signing.',
      aiInsight: '3 of your 8 messages today require decisions before noon. Front-load your morning to avoid a cascade of blockers by 2PM.',
      mood: 'critical',
    });
  }
}
