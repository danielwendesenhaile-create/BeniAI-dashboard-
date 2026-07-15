import { NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';
import { requireAuth } from '@/lib/apiAuth';
import { tokenStore } from '@/lib/tokenStore';
import { classifyAndDelegate } from '@/lib/agentPipeline';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await requireAuth();
    await tokenStore.loadFromDb(userId);

    const tokens = tokenStore.getSlack(userId);
    if (!tokens) return NextResponse.json({ error: 'Slack not connected', connected: false }, { status: 401 });

    const slack = new WebClient(tokens.bot_token);
    const convList = await slack.conversations.list({ types: 'im,public_channel,private_channel', limit: 20 });
    const channels = convList.channels ?? [];
    const items = [];
    const cutoff = Math.floor(Date.now() / 1000) - 86400;

    for (const channel of channels.slice(0, 5)) {
      if (!channel.id) continue;
      const history = await slack.conversations.history({ channel: channel.id, oldest: String(cutoff), limit: 5 });
      const messages = (history.messages ?? []).filter((m) => m.type === 'message' && m.text && !m.bot_id);

      for (const msg of messages) {
        if (!msg.text || !msg.ts) continue;
        let sender = 'Slack User';
        if (msg.user) {
          try {
            const info = await slack.users.info({ user: msg.user });
            sender = info.user?.real_name ?? info.user?.name ?? 'Slack User';
          } catch { /* non-critical */ }
        }
        const channelName = channel.name ? `#${channel.name}` : 'DM';
        const timestamp = new Date(parseFloat(msg.ts) * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const item = await classifyAndDelegate({
          id: `slack-${msg.ts}`,
          source: 'slack',
          sender: `${sender} · ${channelName}`,
          subject: msg.text.slice(0, 80),
          body: msg.text.slice(0, 2000),
          timestamp,
        });

        await db.priorityItem.upsert({
          where: { id: item.id },
          create: { ...item, userId },
          update: { ...item },
        });
        await db.stats.upsert({
          where: { userId },
          create: { userId, messagesFiltered: 1 },
          update: { messagesFiltered: { increment: 1 } },
        });
        items.push(item);
      }
    }

    return NextResponse.json({ items, count: items.length });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('[Slack sync]', err);
    return NextResponse.json({ error: 'Slack sync failed' }, { status: 500 });
  }
}
