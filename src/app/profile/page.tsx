'use client';

import { useState } from 'react';
import LeftNav from '@/components/LeftNav';
import {
  User, Mail, Building2, Globe, Phone, Camera,
  CheckCircle2, Zap, Crown, Star, Shield, ArrowRight,
  CreditCard, Calendar, Download, ChevronRight,
  Lock, Bell, Trash2, AlertTriangle, Sparkles,
  TrendingUp, Clock, BarChart3,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
type PlanId = 'executive' | 'enterprise' | 'custom';

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  billing: string;
  color: string;
  icon: React.ElementType;
  features: string[];
  highlight: boolean;
  badge?: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    id: 'executive',
    name: 'Executive',
    price: '$49',
    billing: '/month',
    color: '#3b82f6',
    icon: Star,
    highlight: false,
    features: [
      '1 Executive profile',
      'Gmail + Slack integration',
      'AI email drafting',
      'Guardian alerts',
      'Calendar scheduling',
      '5,000 AI messages/month',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$149',
    billing: '/month',
    color: '#d4af37',
    icon: Crown,
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 5 executives',
      'All integrations incl. WhatsApp',
      'Team inbox intelligence',
      'Priority Guardian alerts',
      'Dedicated onboarding',
      'Custom AI tone per exec',
      '25,000 AI messages/month',
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    price: 'Custom',
    billing: 'pricing',
    color: '#a855f7',
    icon: Shield,
    highlight: false,
    features: [
      'Unlimited executives',
      'Custom integrations',
      'On-premise deployment',
      'SLA + compliance',
      'White-label option',
      'Dedicated success manager',
      'Unlimited AI messages',
    ],
  },
];

const INVOICES = [
  { id: 'INV-2026-07', date: 'Jul 1, 2026', amount: '$149.00', status: 'Paid', plan: 'Enterprise' },
  { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: '$149.00', status: 'Paid', plan: 'Enterprise' },
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: '$49.00', status: 'Paid', plan: 'Executive' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$49.00', status: 'Paid', plan: 'Executive' },
];

const USAGE = [
  { label: 'AI Messages Used', used: 18420, total: 25000, color: '#d4af37' },
  { label: 'Emails Drafted', used: 312, total: 1000, color: '#3b82f6' },
  { label: 'Meetings Scheduled', used: 47, total: 200, color: '#22c55e' },
  { label: 'Guardian Alerts', used: 8, total: 50, color: '#ef4444' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function UsageBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [currentPlan] = useState<PlanId>('enterprise');
  const [tab, setTab] = useState<'profile' | 'plan' | 'billing' | 'security'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<PlanId | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Chief Executive',
    email: 'danielwendesenhaile@gmail.com',
    company: 'My Company Inc.',
    role: 'Chief Executive Officer',
    phone: '+1 415 555 0192',
    website: 'https://mycompany.com',
    bio: 'Founder and CEO focused on scaling operations and building high-performance teams.',
    timezone: 'America/Los_Angeles',
  });
  const [form, setForm] = useState(profile);

  const activePlan = PLANS.find((p) => p.id === currentPlan)!;
  const PlanIcon = activePlan.icon;

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'plan', label: 'Plan & Usage', icon: Crown },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
  ] as const;

  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto">

        {/* ── Profile hero ── */}
        <div className="relative px-8 pt-8 pb-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)' }} />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f5d87a)', color: '#09090b', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}>
                CE
              </div>
              <button className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.6)' }}>
                <Camera size={16} style={{ color: '#fff' }} />
              </button>
            </div>

            {/* Name + plan badge */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{profile.name}</h1>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: `${activePlan.color}18`, border: `1px solid ${activePlan.color}40`, color: activePlan.color }}>
                  <PlanIcon size={11} />
                  {activePlan.name} Plan
                </div>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{profile.role} · {profile.company}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
            </div>

            <button
              onClick={() => { setEditMode((e) => !e); if (editMode) setProfile(form); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: editMode ? 'var(--accent-gold)' : 'var(--bg-elevated)', color: editMode ? '#09090b' : 'var(--text-secondary)', border: editMode ? 'none' : '1px solid var(--border)' }}>
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id as typeof tab)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative"
                style={{ color: tab === id ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                <Icon size={14} />
                {label}
                {tab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: 'var(--accent-gold)' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="px-8 py-6">

          {/* ── Profile Tab ── */}
          {tab === 'profile' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
                  </div>
                  <div className="px-6 py-5 grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name', key: 'name', icon: User },
                      { label: 'Email Address', key: 'email', icon: Mail },
                      { label: 'Company', key: 'company', icon: Building2 },
                      { label: 'Job Title', key: 'role', icon: TrendingUp },
                      { label: 'Phone', key: 'phone', icon: Phone },
                      { label: 'Website', key: 'website', icon: Globe },
                    ].map(({ label, key, icon: Icon }) => (
                      <div key={key}>
                        <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Icon size={11} /> {label}
                        </label>
                        {editMode ? (
                          <input
                            value={form[key as keyof typeof form]}
                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                            className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
                            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                          />
                        ) : (
                          <div className="text-sm py-2.5 px-3 rounded-xl" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                            {profile[key as keyof typeof profile] || '—'}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Bio — full width */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Bio</label>
                      {editMode ? (
                        <textarea
                          value={form.bio}
                          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                          rows={3}
                          className="w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                        />
                      ) : (
                        <div className="text-sm py-2.5 px-3 rounded-xl leading-relaxed" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                          {profile.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI prefs summary + stats */}
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <Zap size={13} style={{ color: 'var(--accent-gold)' }} />
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Preferences</h3>
                    </div>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-3">
                    {[
                      { label: 'Default Tone', value: 'Formal' },
                      { label: 'Draft Length', value: '120 words' },
                      { label: 'Signature', value: 'Best regards, Executive' },
                      { label: 'Timezone', value: profile.timezone },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                      </div>
                    ))}
                    <button className="mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                      onClick={() => window.location.href = '/settings'}>
                      Edit in Settings <ChevronRight size={11} />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={13} style={{ color: '#3b82f6' }} />
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>This Month</h3>
                    </div>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-3">
                    {[
                      { label: 'Messages handled', value: '247', color: '#d4af37' },
                      { label: 'Drafts approved', value: '31', color: '#3b82f6' },
                      { label: 'Hours saved', value: '~48h', color: '#22c55e' },
                      { label: 'Alerts fired', value: '2', color: '#ef4444' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                        <span className="text-sm font-bold" style={{ color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Plan & Usage Tab ── */}
          {tab === 'plan' && (
            <div className="flex flex-col gap-6">
              {/* Current plan banner */}
              <div className="flex items-center gap-5 px-6 py-5 rounded-2xl"
                style={{ background: `${activePlan.color}08`, border: `1px solid ${activePlan.color}30` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${activePlan.color}18`, border: `1px solid ${activePlan.color}35` }}>
                  <PlanIcon size={22} style={{ color: activePlan.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{activePlan.name} Plan</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${activePlan.color}20`, color: activePlan.color }}>Active</span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {activePlan.price}{activePlan.billing} · Renews August 1, 2026
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    onClick={() => setCancelConfirm(true)}>
                    Cancel Plan
                  </button>
                </div>
              </div>

              {/* Usage */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <TrendingUp size={14} style={{ color: '#d4af37' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Usage This Billing Period</h2>
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>Jul 1 – Jul 31, 2026</span>
                </div>
                <div className="px-6 py-5 grid sm:grid-cols-2 gap-5">
                  {USAGE.map((u) => <UsageBar key={u.label} {...u} />)}
                </div>
              </div>

              {/* Plan comparison */}
              <div>
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Change Plan
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrent = plan.id === currentPlan;
                    return (
                      <div key={plan.id} className="rounded-2xl p-5 flex flex-col relative overflow-hidden"
                        style={{
                          background: isCurrent ? `${plan.color}08` : 'var(--bg-surface)',
                          border: isCurrent ? `2px solid ${plan.color}50` : '1px solid var(--border)',
                        }}>
                        {isCurrent && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: `${plan.color}20`, color: plan.color }}>
                            <CheckCircle2 size={10} /> Current
                          </div>
                        )}
                        {plan.badge && !isCurrent && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: plan.color, color: '#09090b' }}>{plan.badge}</div>
                        )}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
                          <Icon size={18} style={{ color: plan.color }} />
                        </div>
                        <div className="text-base font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{plan.name}</div>
                        <div className="flex items-baseline gap-0.5 mb-4">
                          <span className="text-2xl font-black" style={{ color: plan.color }}>{plan.price}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{plan.billing}</span>
                        </div>
                        <ul className="flex flex-col gap-2 flex-1 mb-4">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          disabled={isCurrent}
                          onClick={() => !isCurrent && setShowUpgradeModal(plan.id)}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                          style={{
                            background: isCurrent ? 'transparent' : plan.color === '#d4af37' ? 'linear-gradient(135deg,#d4af37,#f5d87a)' : `${plan.color}`,
                            color: isCurrent ? plan.color : plan.color === '#d4af37' ? '#09090b' : '#fff',
                            border: isCurrent ? `1px solid ${plan.color}40` : 'none',
                          }}>
                          {isCurrent ? 'Current Plan' : plan.id === 'custom' ? 'Talk to Sales' : 'Switch Plan'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Billing Tab ── */}
          {tab === 'billing' && (
            <div className="flex flex-col gap-6">
              {/* Payment method */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} style={{ color: 'var(--accent-gold)' }} />
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Method</h2>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    Update
                  </button>
                </div>
                <div className="px-6 py-5 flex items-center gap-4">
                  <div className="w-14 h-9 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{ background: '#1a1a2e', color: '#fff', border: '1px solid var(--border)' }}>VISA</div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Visa ending in 4242</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Expires 12/2028 · Auto-renew enabled</div>
                  </div>
                  <CheckCircle2 size={16} className="ml-auto" style={{ color: '#22c55e' }} />
                </div>
              </div>

              {/* Billing summary */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Calendar size={14} style={{ color: '#3b82f6' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Billing Summary</h2>
                </div>
                <div className="px-6 py-5 flex flex-col gap-3">
                  {[
                    { label: 'Current plan', value: `${activePlan.name} — ${activePlan.price}${activePlan.billing}` },
                    { label: 'Next billing date', value: 'August 1, 2026' },
                    { label: 'Billing email', value: profile.email },
                    { label: 'Member since', value: 'April 1, 2026' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice history */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Download size={14} style={{ color: '#22c55e' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Invoice History</h2>
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                  {INVOICES.map((inv) => (
                    <div key={inv.id} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="flex-1">
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.id}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{inv.date} · {inv.plan} Plan</div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{inv.amount}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                        {inv.status}
                      </span>
                      <button className="flex items-center gap-1 text-xs transition-all hover:opacity-70"
                        style={{ color: 'var(--text-muted)' }}>
                        <Download size={11} /> PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {tab === 'security' && (
            <div className="flex flex-col gap-6 max-w-2xl">
              {/* Auth method */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Lock size={14} style={{ color: 'var(--accent-gold)' }} />
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Authentication</h2>
                  </div>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                      <Mail size={18} style={{ color: '#ef4444' }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Google OAuth</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Signed in with {profile.email}</div>
                    </div>
                    <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Your account is secured with Google OAuth. No password is stored — BeniAI never sees your Google credentials.
                  </p>
                </div>
              </div>

              {/* Sessions */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Globe size={14} style={{ color: '#3b82f6' }} />
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Active Sessions</h2>
                  </div>
                  <button className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                    Sign out all
                  </button>
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
                  {[
                    { device: 'MacBook Pro · Chrome', location: 'San Francisco, CA', time: 'Active now', current: true },
                    { device: 'iPhone 15 Pro · Safari', location: 'San Francisco, CA', time: '2 hours ago', current: false },
                  ].map(({ device, location, time, current }) => (
                    <div key={device} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{device}</span>
                          {current && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>Current</span>}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{location} · {time}</div>
                      </div>
                      {!current && (
                        <button className="text-xs transition-all hover:opacity-70" style={{ color: '#ef4444' }}>Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification prefs */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Bell size={14} style={{ color: '#a855f7' }} />
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Data & Privacy</h2>
                  </div>
                </div>
                <div className="px-6 py-5 flex flex-col gap-3">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    BeniAI encrypts all OAuth tokens with AES-256 at rest. Your email content is processed in-memory only and never stored permanently. Agent logs are retained for 30 days.
                  </p>
                  <button className="flex items-center gap-2 text-xs font-medium mt-1 transition-all hover:opacity-70"
                    style={{ color: '#3b82f6' }}>
                    Download my data <ArrowRight size={11} />
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                    <h2 className="text-sm font-semibold" style={{ color: '#ef4444' }}>Danger Zone</h2>
                  </div>
                </div>
                <div className="px-6 py-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Delete Account</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Permanently delete your BeniAI account and all data</div>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Upgrade modal ── */}
      {showUpgradeModal && (() => {
        const target = PLANS.find((p) => p.id === showUpgradeModal)!;
        const TargetIcon = target.icon;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-1">
                  <TargetIcon size={18} style={{ color: target.color }} />
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Switch to {target.name}
                  </h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {target.price}{target.billing} — effective immediately, prorated from today.
                </p>
              </div>
              <div className="px-6 py-4 flex flex-col gap-2">
                {target.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} style={{ color: '#22c55e' }} /> {f}
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setShowUpgradeModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
                <button onClick={() => setShowUpgradeModal(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: target.color === '#d4af37' ? 'linear-gradient(135deg,#d4af37,#f5d87a)' : target.color, color: target.color === '#d4af37' ? '#09090b' : '#fff' }}>
                  Confirm Switch
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Cancel confirm modal ── */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="px-6 py-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={22} style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Cancel your plan?</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                You'll keep access until August 1, 2026. After that, all integrations and AI agents will be paused.
              </p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Keep Plan
              </button>
              <button onClick={() => setCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
