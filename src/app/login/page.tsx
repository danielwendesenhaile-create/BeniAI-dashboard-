import { signIn } from '@/lib/auth';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent-gold)' }}
          >
            <Zap size={24} strokeWidth={2.5} style={{ color: '#09090b' }} />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>BeniAI</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Executive Command Center</div>
          </div>
        </div>

        <div className="w-full h-px" style={{ background: 'var(--border)' }} />

        <div className="text-center">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sign in to access your AI-powered command center</p>
        </div>

        {/* Sign in form */}
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--accent-gold)', color: '#09090b' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Your data is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  );
}
