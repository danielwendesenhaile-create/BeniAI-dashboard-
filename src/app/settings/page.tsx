import LeftNav from '@/components/LeftNav';
import SettingsPanel from '@/components/SettingsPanel';

export default function SettingsPage() {
  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-8">
        <SettingsPanel />
      </main>
    </div>
  );
}
