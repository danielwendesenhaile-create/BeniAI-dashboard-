import { auth } from '@/lib/auth';
import OnboardingFlow from '@/components/OnboardingFlow';

export default async function OnboardingPage() {
  const session = await auth();
  return <OnboardingFlow name={session?.user?.name ?? null} />;
}
