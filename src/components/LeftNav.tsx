'use client';

import { LayoutDashboard, Inbox, CalendarDays, Users, Settings, Zap, Plug, Crown, ChevronRight, BarChart3, Shield, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Morning Briefing', icon: Zap, href: '/briefing' },
  { label: 'Priority Feed', icon: Inbox, href: '/feed' },
  { label: 'Calendar', icon: CalendarDays, href: '/calendar' },
  { label: 'Contacts', icon: Users, href: '/contacts' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Integrations', icon: Plug, href: '/integrations' },
  { label: 'Audit Log', icon: Shield, href: '/audit' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function LeftNav() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col h-full sticky top-0"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        width: 240,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg w-9 h-9"
          style={{ background: 'var(--accent-gold)', color: '#09090b' }}
        >
          <Zap size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
            BeniAI
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Command Center
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid transparent',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — profile link */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-90 group"
          style={{
            background: pathname.startsWith('/profile') ? 'rgba(212,175,55,0.1)' : 'var(--bg-elevated)',
            border: pathname.startsWith('/profile') ? '1px solid rgba(212,175,55,0.25)' : '1px solid var(--border)',
          }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#d4af37,#f5d87a)', color: '#09090b' }}>
            CE
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              Chief Executive
            </div>
            <div className="flex items-center gap-1">
              <Crown size={9} style={{ color: '#d4af37' }} />
              <span className="text-xs" style={{ color: '#d4af37' }}>Enterprise Plan</span>
            </div>
          </div>
          <ChevronRight size={13} className="opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
        </Link>
      </div>
    </aside>
  );
}
