import { NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';
import { tokenStore } from '@/lib/tokenStore';
import { classifyAndDelegate } from '@/lib/agentPipeline';
import { PriorityItem } from '@/data/mockData';

export async function GET() {
  const tokens = tokenStore.getSlack();
  if (!tokens) {
    return NextResponse.json({ error: 'Slack not connected', connected: false }, { status: 401 });
  }

  try {
    const slack = new WebClient(tokens.bot_token);

    // Fetch DMs and channels the bot is in
    const convList = await slack.conversations.list({
      types: 'im,public_channel,private_channel',
      limit: 20,
    });

    const channels = convList.channels ?? [];
    const items: PriorityItem[] = [];
    const cutoff = Math.floor(Date.now() / 1000) - 86400; // last 24h

    for (const channel of channels.slice(0, 5)) {
      if (!channel.id) continue;

      const history = await slack.conversations.history({
        channel: channel.id,
        oldest: String(cutoff),
        limit: 5,
      });

      const messages = (history.messages ?? []).filter(
        (m) => m.type === 'message' && m.text && !m.bot_id
      );

      for (const msg of messages) {
        if (!msg.text || !msg.ts) continue;

        // Resolve username
        let sender = 'Slack User';
        if (msg.user) {
          try {
            const userInfo = await slack.users.info({ user: msg.user });
            sender = userInfo.user?.real_name ?? userInfo.user?.name ?? 'Slack User';
          } catch {
            // non-critical
          }
        }

        const channelName = channel.name ? `#${channel.name}` : 'DM';
        const timestamp = new Date(parseFloat(msg.ts) * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const item = await classifyAndDelegate({
          id: `slack-${msg.ts}`,
          source: 'slack',
          sender: `${sender} · ${channelName}`,
          subject: msg.text.slice(0, 80),
          body: msg.text.slice(0, 2000),
          timestamp,
        });

        items.push(item);
      }
    }

    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    console.error('[Slack sync]', err);
    return NextResponse.json({ error: 'Slack sync failed' }, { status: 500 });
  }
}
