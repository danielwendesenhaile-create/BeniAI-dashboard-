'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Zap, Mail, Shield, Calendar, MessageCircle, Hash,
  ArrowRight, CheckCircle2, Star, ChevronDown,
  Brain, Clock, TrendingUp, Lock, Globe, Bell,
  Sparkles, Users, BarChart3, Inbox,
} from 'lucide-react';

// ── Particle canvas ───────────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; gold: boolean }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        gold: Math.random() > 0.6,
      });
    }

    // Orbs
    const orbs: { x: number; y: number; r: number; dx: number; dy: number; hue: string }[] = [
      { x: canvas.width * 0.15, y: canvas.height * 0.3, r: 280, dx: 0.2, dy: 0.15, hue: 'rgba(212,175,55,' },
      { x: canvas.width * 0.85, y: canvas.height * 0.6, r: 220, dx: -0.15, dy: 0.2, hue: 'rgba(168,85,247,' },
      { x: canvas.width * 0.5, y: canvas.height * 0.8, r: 180, dx: 0.1, dy: -0.1, hue: 'rgba(59,130,246,' },
    ];

    let frame = 0;
    let animId: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw orbs
      orbs.forEach((orb) => {
        orb.x += orb.dx;
        orb.y += orb.dy;
        if (orb.x < -orb.r || orb.x > canvas.width + orb.r) orb.dx *= -1;
        if (orb.y < -orb.r || orb.y > canvas.height + orb.r) orb.dy *= -1;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.hue + '0.08)');
        grad.addColorStop(1, orb.hue + '0)');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulse = Math.sin(frame * 0.02 + p.x * 0.01) * 0.15 + 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,175,55,${p.opacity * pulse})`
          : `rgba(255,255,255,${p.opacity * pulse * 0.4})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,175,55,${(1 - dist / 100) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frame++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────

function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = to / 60;
      const tick = () => {
        start = Math.min(start + step, to);
        setVal(Math.floor(start));
        if (start < to) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Scroll reveal wrapper ─────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    color: '#d4af37',
    bg: 'rgba(212,175,55,0.1)',
    border: 'rgba(212,175,55,0.25)',
    title: 'AI Message Router',
    desc: 'Every email, Slack message, and WhatsApp is classified by urgency in milliseconds. Emergency, Urgent, Scheduling, or Informational — BeniAI knows before you do.',
  },
  {
    icon: Mail,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    title: 'Email Agent',
    desc: 'Drafts context-aware replies that match your tone, signature, and expertise. Review, approve, and send — or let BeniAI handle routine responses automatically.',
  },
  {
    icon: Shield,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.25)',
    title: 'Guardian Agent',
    desc: 'Never miss a crisis. The Guardian scans every message for legal, financial, or reputational risks and escalates emergencies with an immediate alert — even at 3am.',
  },
  {
    icon: Calendar,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
    title: 'Scheduler Agent',
    desc: 'Reads meeting requests, checks your availability, proposes optimal time slots, and books the calendar event — all without you lifting a finger.',
  },
  {
    icon: Hash,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.25)',
    title: 'Slack Intelligence',
    desc: 'Monitors your Slack channels in real time. Surfaces decisions that need your attention, drafts responses, and keeps team threads moving without your constant presence.',
  },
  {
    icon: MessageCircle,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.25)',
    title: 'WhatsApp Command',
    desc: 'Your business WhatsApp line handled professionally. BeniAI reads inbound messages, classifies them, and drafts replies so every client feels heard instantly.',
  },
];

const STATS = [
  { value: 94, suffix: '%', label: 'Time saved on email triage', prefix: '' },
  { value: 3, suffix: 'x', label: 'Faster response times', prefix: '' },
  { value: 12, suffix: 'h', label: 'Saved per executive per week', prefix: '' },
  { value: 500, suffix: '+', label: 'CEOs & entrepreneurs on waitlist', prefix: '' },
];

const WORKFLOW = [
  { step: '01', icon: Inbox, title: 'Messages arrive', desc: 'Gmail, Slack, and WhatsApp all funnel into BeniAI\'s unified intelligence layer.' },
  { step: '02', icon: Brain, title: 'AI classifies & routes', desc: 'The Router Agent reads every message and delegates to the right specialist agent in under 2 seconds.' },
  { step: '03', icon: Sparkles, title: 'Draft is generated', desc: 'Email, Slack, or WhatsApp replies are drafted in your voice, with your signature, at your preferred length.' },
  { step: '04', icon: CheckCircle2, title: 'You approve & send', desc: 'One tap to approve. BeniAI dispatches the reply to the original thread and logs the action.' },
];

const TESTIMONIALS = [
  {
    name: 'Marcus Chen',
    role: 'CEO, Veritas Capital',
    avatar: 'MC',
    color: '#d4af37',
    text: 'I used to spend 3 hours a day on email. BeniAI cut that to 20 minutes. My team thinks I\'ve become superhuman.',
  },
  {
    name: 'Sarah Okafor',
    role: 'Founder, NovaBridge',
    avatar: 'SO',
    color: '#a855f7',
    text: 'The Guardian Agent caught a contract clause that could have cost us $400K. It paid for itself in the first week.',
  },
  {
    name: 'James Whitfield',
    role: 'Managing Partner, Horizon Ventures',
    avatar: 'JW',
    color: '#3b82f6',
    text: 'BeniAI handles my entire inbox overnight. I wake up to decisions, not noise. This is what leverage looks like.',
  },
];

const PLANS = [
  {
    name: 'Executive',
    price: '49',
    desc: 'For solo founders and CEOs',
    features: ['1 Executive profile', 'Gmail + Slack integration', 'AI email drafting', 'Guardian alerts', 'Calendar scheduling'],
    highlight: false,
    cta: 'Get Early Access',
  },
  {
    name: 'Enterprise',
    price: '149',
    desc: 'For leadership teams',
    features: ['Up to 5 executives', 'All integrations incl. WhatsApp', 'Team inbox intelligence', 'Priority Guardian alerts', 'Dedicated onboarding', 'Custom AI tone per exec'],
    highlight: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Custom',
    price: 'Talk to us',
    desc: 'For large organisations',
    features: ['Unlimited executives', 'Custom integrations', 'On-premise deployment', 'SLA + compliance', 'White-label option', 'Dedicated success manager'],
    highlight: false,
    cta: 'Book a Demo',
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────

// ── Waitlist Form ─────────────────────────────────────────────────────────────
function WaitlistForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setMsg(data.message);
      setStatus('success');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: '#22c55e' }} />
        <p className="font-semibold mb-1" style={{ color: '#fafafa' }}>You're on the list!</p>
        <p className="text-sm" style={{ color: '#71717a' }}>{msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Your name" required
        className="px-4 py-3 rounded-xl text-sm outline-none w-full"
        style={{ background: '#111113', border: '1px solid #27272a', color: '#fafafa' }} />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Work email address" required
        className="px-4 py-3 rounded-xl text-sm outline-none w-full"
        style={{ background: '#111113', border: '1px solid #27272a', color: '#fafafa' }} />
      <input value={company} onChange={(e) => setCompany(e.target.value)}
        placeholder="Company (optional)"
        className="px-4 py-3 rounded-xl text-sm outline-none w-full"
        style={{ background: '#111113', border: '1px solid #27272a', color: '#fafafa' }} />
      {status === 'error' && <p className="text-xs" style={{ color: '#ef4444' }}>{msg}</p>}
      <button type="submit" disabled={status === 'loading'}
        className="w-full py-4 rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg,#d4af37,#f5d87a)', color: '#09090b' }}>
        {status === 'loading' ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> Joining…</> : <><Zap size={15} strokeWidth={2.5} /> Reserve My Spot</>}
      </button>
      <p className="text-xs" style={{ color: '#3f3f46' }}>No credit card required. Cancel anytime.</p>
    </form>
  );
}

// ── ROI Calculator ────────────────────────────────────────────────────────────
function RoiCalculator() {
  const [hourlyRate, setHourlyRate] = useState(500);
  const [hoursSaved, setHoursSaved] = useState(10);
  const plan = 149;
  const weeklyValue = hourlyRate * hoursSaved;
  const monthlyValue = weeklyValue * 4;
  const net = monthlyValue - plan;
  const multiple = Math.round(monthlyValue / plan);

  return (
    <div className="p-6 md:p-8 rounded-2xl" style={{ background: '#111113', border: '1px solid #1f1f23' }}>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#a1a1aa' }}>
              Your hourly rate: <span style={{ color: '#d4af37' }}>${hourlyRate.toLocaleString()}/hr</span>
            </label>
            <input type="range" min={100} max={5000} step={50} value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full accent-yellow-500" />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#52525b' }}>
              <span>$100</span><span>$5,000</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#a1a1aa' }}>
              Hours saved per week: <span style={{ color: '#d4af37' }}>{hoursSaved}h</span>
            </label>
            <input type="range" min={2} max={20} step={1} value={hoursSaved}
              onChange={(e) => setHoursSaved(Number(e.target.value))}
              className="w-full accent-yellow-500" />
            <div className="flex justify-between text-xs mt-1" style={{ color: '#52525b' }}>
              <span>2h</span><span>20h</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: 'Monthly value recovered', value: `$${monthlyValue.toLocaleString()}`, color: '#22c55e' },
            { label: 'BeniAI Enterprise plan', value: `-$${plan}`, color: '#ef4444' },
            { label: 'Net monthly ROI', value: `+$${net.toLocaleString()}`, color: '#d4af37', large: true },
          ].map(({ label, value, color, large }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: '#18181b', border: '1px solid #27272a' }}>
              <span className="text-sm" style={{ color: '#71717a' }}>{label}</span>
              <span className={large ? 'text-2xl font-black' : 'text-lg font-bold'} style={{ color }}>{value}</span>
            </div>
          ))}
          <div className="mt-2 p-4 rounded-xl text-center"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div className="text-4xl font-black mb-1"
              style={{ background: 'linear-gradient(135deg,#d4af37,#f5d87a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {multiple}×
            </div>
            <div className="text-xs" style={{ color: '#71717a' }}>return on investment</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: '#09090b', color: '#fafafa' }}>
      <ParticleCanvas />

      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(9,9,11,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(39,39,42,0.8)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-gold)' }}>
              <Zap size={16} strokeWidth={2.5} style={{ color: '#09090b' }} />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: '#fafafa' }}>BeniAI</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Pricing', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm transition-colors hover:text-white"
                style={{ color: '#a1a1aa' }}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <a
              href="/api/auth/signin"
              className="hidden md:block text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{ color: '#a1a1aa', border: '1px solid #27272a' }}
            >
              Log in
            </a>
            <a
              href="/api/auth/signin"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90 flex items-center gap-1.5"
              style={{ background: 'var(--accent-gold)', color: '#09090b' }}
            >
              Get Access
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16" style={{ zIndex: 1 }}>
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)',
            color: 'var(--accent-gold)',
            animation: 'fadeDown 0.8s ease both',
          }}
        >
          <Sparkles size={12} />
          Built for CEOs & Entrepreneurs
          <Sparkles size={12} />
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-6 max-w-4xl"
          style={{ animation: 'fadeUp 0.9s ease 0.1s both' }}
        >
          Your AI Executive{' '}
          <span
            className="relative inline-block"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f5d87a 50%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Personal Assistant
          </span>
        </h1>

        {/* Subhead */}
        <p
          className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          style={{ color: '#a1a1aa', animation: 'fadeUp 0.9s ease 0.2s both' }}
        >
          BeniAI reads your inbox, classifies every message, drafts replies in your voice,
          and alerts you to what truly matters — so you can focus on building your empire.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          style={{ animation: 'fadeUp 0.9s ease 0.3s both' }}
        >
          <a
            href="/api/auth/signin"
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f5d87a)',
              color: '#09090b',
              boxShadow: '0 0 40px rgba(212,175,55,0.3)',
            }}
          >
            <Zap size={18} strokeWidth={2.5} />
            Start for Free with Google
          </a>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-6 py-4 rounded-xl text-base font-medium transition-all hover:opacity-80"
            style={{ border: '1px solid #27272a', color: '#a1a1aa' }}
          >
            See how it works
            <ChevronDown size={16} />
          </a>
        </div>

        {/* Dashboard preview mockup */}
        <div
          className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden relative"
          style={{
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 0 80px rgba(212,175,55,0.08), 0 40px 120px rgba(0,0,0,0.8)',
            animation: 'fadeUp 1s ease 0.4s both',
            background: '#111113',
          }}
        >
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#18181b', borderBottom: '1px solid #27272a' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
            <div className="flex-1 mx-4 px-3 py-1 rounded text-xs text-center" style={{ background: '#09090b', color: '#52525b', maxWidth: 260, margin: '0 auto' }}>
              app.beniai.com
            </div>
          </div>

          {/* Mock dashboard */}
          <div className="grid grid-cols-12 h-64 md:h-80">
            {/* Left nav */}
            <div className="col-span-2 hidden md:flex flex-col gap-2 p-3" style={{ borderRight: '1px solid #27272a' }}>
              {['Dashboard', 'Priority', 'Calendar', 'Contacts', 'Settings'].map((item, i) => (
                <div key={item} className="px-2 py-1.5 rounded text-xs flex items-center gap-2"
                  style={{ background: i === 1 ? 'rgba(212,175,55,0.12)' : 'transparent', color: i === 1 ? '#d4af37' : '#52525b' }}>
                  <div className="w-2.5 h-2.5 rounded" style={{ background: i === 1 ? '#d4af37' : '#27272a' }} />
                  {item}
                </div>
              ))}
            </div>

            {/* Feed */}
            <div className="col-span-12 md:col-span-7 p-4 flex flex-col gap-2.5 overflow-hidden">
              <div className="text-xs font-semibold mb-1" style={{ color: '#52525b' }}>PRIORITY FEED</div>
              {[
                { label: '🚨 Emergency', color: '#ef4444', subject: 'Board meeting — legal issue flagged', from: 'jennifer@lawfirm.com' },
                { label: '⚡ Urgent', color: '#f59e0b', subject: 'Q3 investor deck needs your sign-off', from: 'mike@sequoia.com' },
                { label: '📅 Scheduling', color: '#3b82f6', subject: 'Partnership call — pick a time', from: 'ceo@acmecorp.com' },
              ].map((card) => (
                <div key={card.subject} className="px-3 py-2.5 rounded-lg flex items-center gap-3"
                  style={{ background: '#18181b', border: '1px solid #27272a' }}>
                  <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: card.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: '#fafafa' }}>{card.subject}</div>
                    <div className="text-xs truncate" style={{ color: '#52525b' }}>{card.from}</div>
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${card.color}20`, color: card.color }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Right panel */}
            <div className="hidden md:flex col-span-3 flex-col p-4 gap-3" style={{ borderLeft: '1px solid #27272a' }}>
              <div className="text-xs font-semibold" style={{ color: '#52525b' }}>AGENT LOG</div>
              {['Router: classified 12 messages', 'Email Agent: draft ready', 'Guardian: no threats', 'Scheduler: meeting booked'].map((log) => (
                <div key={log} className="text-xs px-2 py-1.5 rounded" style={{ background: '#18181b', color: '#52525b' }}>
                  <span style={{ color: '#d4af37' }}>•</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animation: 'bounce 2s infinite' }}>
          <ChevronDown size={20} style={{ color: '#52525b' }} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative py-20 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, suffix, prefix, label }, i) => (
            <Reveal key={label} delay={i * 80} className="text-center">
              <div className="text-4xl md:text-5xl font-black mb-2"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f5d87a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                <Counter to={value} suffix={suffix} prefix={prefix} />
              </div>
              <div className="text-sm" style={{ color: '#52525b' }}>{label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37' }}>
              <Zap size={11} /> Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Six agents.{' '}
              <span style={{ color: '#d4af37' }}>One command center.</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a1a1aa' }}>
              BeniAI's multi-agent architecture means each communication channel gets a specialist — not a generalist.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div
                  className="p-6 rounded-2xl h-full transition-all duration-300 group cursor-default"
                  style={{
                    background: '#111113',
                    border: `1px solid #27272a`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = `1px solid ${border}`;
                    e.currentTarget.style.background = bg;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 20px 60px ${color}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid #27272a';
                    e.currentTarget.style.background = '#111113';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#fafafa' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#71717a' }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative py-24 px-6" style={{ zIndex: 1, background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6' }}>
              <TrendingUp size={11} /> How it works
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              From inbox chaos to{' '}
              <span style={{ color: '#d4af37' }}>calm clarity</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#a1a1aa' }}>
              Four steps from noisy inbox to approved reply — under 10 seconds.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, #a855f7, #3b82f6, transparent)' }} />

            {WORKFLOW.map(({ step, icon: Icon, title, desc }, i) => (
              <Reveal key={step} delay={i * 100} className="flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <div
                    className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #18181b, #111113)',
                      border: '1px solid #27272a',
                      boxShadow: '0 0 30px rgba(212,175,55,0.08)',
                    }}
                  >
                    <Icon size={24} style={{ color: '#d4af37' }} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: '#d4af37', color: '#09090b' }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#fafafa' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#71717a' }}>{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7' }}>
              <Users size={11} /> Trusted by leaders
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              What executives are{' '}
              <span style={{ color: '#d4af37' }}>saying</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, avatar, color, text }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div className="p-6 rounded-2xl h-full flex flex-col"
                  style={{ background: '#111113', border: '1px solid #27272a' }}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={13} fill="#d4af37" style={{ color: '#d4af37' }} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed flex-1 mb-6 italic" style={{ color: '#a1a1aa' }}>
                    "{text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: color, color: '#09090b' }}>
                      {avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#fafafa' }}>{name}</div>
                      <div className="text-xs" style={{ color: '#52525b' }}>{role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative py-24 px-6" style={{ zIndex: 1, background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
              <BarChart3 size={11} /> Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Simple, transparent{' '}
              <span style={{ color: '#d4af37' }}>pricing</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#a1a1aa' }}>
              Less than one hour of executive time per month. Start free.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, desc, features, highlight, cta }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div
                  className="p-6 rounded-2xl h-full flex flex-col relative overflow-hidden"
                  style={{
                    background: highlight ? 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.04))' : '#111113',
                    border: highlight ? '1px solid rgba(212,175,55,0.4)' : '1px solid #27272a',
                    boxShadow: highlight ? '0 0 60px rgba(212,175,55,0.1)' : 'none',
                  }}
                >
                  {highlight && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: '#d4af37', color: '#09090b' }}>
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-1" style={{ color: highlight ? '#d4af37' : '#a1a1aa' }}>{name}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      {price !== 'Talk to us' && <span className="text-lg" style={{ color: '#52525b' }}>$</span>}
                      <span className="text-4xl font-black" style={{ color: '#fafafa' }}>{price}</span>
                      {price !== 'Talk to us' && <span className="text-sm" style={{ color: '#52525b' }}>/month</span>}
                    </div>
                    <div className="text-xs" style={{ color: '#52525b' }}>{desc}</div>
                  </div>

                  <ul className="flex flex-col gap-2.5 flex-1 mb-8">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#a1a1aa' }}>
                        <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/api/auth/signin"
                    className="w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{
                      background: highlight ? 'linear-gradient(135deg, #d4af37, #f5d87a)' : 'transparent',
                      color: highlight ? '#09090b' : '#fafafa',
                      border: highlight ? 'none' : '1px solid #27272a',
                    }}
                  >
                    {cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
              <TrendingUp size={11} /> ROI Calculator
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              How much is your{' '}
              <span style={{ color: '#d4af37' }}>time worth?</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#a1a1aa' }}>
              BeniAI saves most executives 8–12 hours per week. See your number.
            </p>
          </Reveal>

          <Reveal>
            <RoiCalculator />
          </Reveal>
        </div>
      </section>

      {/* ── Trust & Security ── */}
      <section className="relative py-20 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37' }}>
              <Shield size={11} /> Enterprise Security
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4" style={{ color: '#fafafa' }}>
              Built for executives who{' '}
              <span style={{ color: '#d4af37' }}>can't afford a breach.</span>
            </h2>
          </Reveal>

          <Reveal>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { icon: Lock, color: '#d4af37', title: 'AES-256 Token Encryption', desc: 'Every OAuth token is encrypted with AES-256-CBC before storage. Your Gmail, Slack, and WhatsApp credentials never exist in plaintext.' },
                { icon: Shield, color: '#22c55e', title: 'SOC 2 Ready Architecture', desc: 'Append-only audit log captures every action BeniAI takes on your behalf — timestamped and tamper-proof. Export any time.' },
                { icon: Globe, color: '#3b82f6', title: 'Zero Data Retention by Default', desc: 'BeniAI processes your messages in memory. We don\'t train on your data. Your emails are yours — period.' },
                { icon: CheckCircle2, color: '#a855f7', title: 'One-Click Revoke', desc: 'Instantly disconnect any integration from Settings. OAuth tokens are deleted server-side in under 500ms.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-4 p-5 rounded-2xl"
                  style={{ background: '#111113', border: '1px solid #1f1f23' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: '#fafafa' }}>{title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: '#71717a' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                'HMAC-SHA256 webhooks', 'Zod input validation', 'Google OAuth 2.0',
                'HTTPS everywhere', 'Rate limiting', 'No password storage',
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ade80' }}>
                  <CheckCircle2 size={11} /> {badge}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section id="waitlist" className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-lg mx-auto text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37' }}>
              <Star size={11} fill="#d4af37" /> Early Access
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: '#fafafa' }}>
              Join the waitlist
            </h2>
            <p className="text-sm mb-8" style={{ color: '#71717a' }}>
              We're onboarding 50 executives per month. Reserve your spot.
            </p>
            <WaitlistForm />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-32 px-6 text-center" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
          <div className="w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
        </div>
        <Reveal className="relative max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Ready to reclaim{' '}
            <span style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f5d87a 50%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              your time?
            </span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#a1a1aa' }}>
            Join the waitlist of CEOs and entrepreneurs already using BeniAI to lead, not manage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/api/auth/signin"
              className="flex items-center gap-2.5 px-10 py-4 rounded-xl text-base font-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #f5d87a)',
                color: '#09090b',
                boxShadow: '0 0 60px rgba(212,175,55,0.35)',
              }}
            >
              <Zap size={18} strokeWidth={2.5} />
              Get Started — It's Free
            </a>
            <a href="#features"
              className="text-sm font-medium px-6 py-4 rounded-xl transition-all hover:opacity-70"
              style={{ color: '#52525b' }}>
              Learn more ↓
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="relative py-10 px-6 text-center" style={{ zIndex: 1, borderTop: '1px solid #18181b' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#d4af37' }}>
            <Zap size={12} strokeWidth={2.5} style={{ color: '#09090b' }} />
          </div>
          <span className="font-bold text-sm" style={{ color: '#fafafa' }}>BeniAI</span>
        </div>
        <p className="text-xs" style={{ color: '#3f3f46' }}>
          © 2026 BeniAI. Built for executives who move fast.
        </p>
      </footer>

      {/* ── Global keyframe animations ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </div>
  );
}
