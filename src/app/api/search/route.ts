import { NextRequest, NextResponse } from 'next/server';
import { mockPriorityItems, mockAgentLogs } from '@/data/mockData';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const messages = mockPriorityItems
    .filter((i) =>
      i.subject.toLowerCase().includes(q) ||
      i.sender.toLowerCase().includes(q) ||
      i.preview.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    )
    .slice(0, 5)
    .map((i) => ({ type: 'message', id: i.id, title: i.subject, sub: i.sender, category: i.category, href: '/feed' }));

  const logs = mockAgentLogs
    .filter((l) => l.message.toLowerCase().includes(q) || l.agent.toLowerCase().includes(q))
    .slice(0, 3)
    .map((l) => ({ type: 'log', id: l.id, title: l.message, sub: `${l.agent} · ${l.time}`, href: '/feed' }));

  const pages = [
    { id: 'p1', title: 'Morning Briefing', href: '/briefing', icon: 'briefing' },
    { id: 'p2', title: 'Analytics & ROI', href: '/analytics', icon: 'analytics' },
    { id: 'p3', title: 'Calendar', href: '/calendar', icon: 'calendar' },
    { id: 'p4', title: 'Contacts', href: '/contacts', icon: 'contacts' },
    { id: 'p5', title: 'Integrations', href: '/integrations', icon: 'integrations' },
    { id: 'p6', title: 'Settings', href: '/settings', icon: 'settings' },
    { id: 'p7', title: 'Audit Log', href: '/audit', icon: 'audit' },
    { id: 'p8', title: 'Profile & Plan', href: '/profile', icon: 'profile' },
  ].filter((p) => p.title.toLowerCase().includes(q)).map((p) => ({ type: 'page', ...p, sub: 'Navigate' }));

  return NextResponse.json({ results: [...messages, ...pages, ...logs] });
}
