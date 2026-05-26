import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import WizardClient from '@/components/wizard/WizardClient';

export default async function NewApplicationPage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  return (
    <main className="flex-1">
      <WizardClient userName={session.user.name ?? ''} />
    </main>
  );
}
