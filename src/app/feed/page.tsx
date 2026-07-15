import LeftNav from '@/components/LeftNav';
import PriorityFeed from '@/components/PriorityFeed';
import RightDrawer from '@/components/RightDrawer';

export default function FeedPage() {
  return (
    <div className="flex h-full w-full" style={{ background: 'var(--bg-base)' }}>
      <LeftNav />
      <main className="flex-1 overflow-y-auto">
        <PriorityFeed />
      </main>
      <RightDrawer />
    </div>
  );
}
