import IntegrationsPanel from '@/components/IntegrationsPanel';
import LeftNav from '@/components/LeftNav';

export default function IntegrationsPage() {
  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-8">
        <IntegrationsPanel />
      </main>
    </div>
  );
}
