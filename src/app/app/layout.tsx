import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import AppSidebar from '@/components/layout/AppSidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/');

  const displayName = session.user.name || session.user.email || 'User';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const signOutForm = (
    <form
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/' });
      }}
    >
      <button
        type="submit"
        title="Sign out"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: '#3f3f46',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </form>
  );

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <AppSidebar
        displayName={displayName}
        initials={initials}
        signOutForm={signOutForm}
      />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#0d0d14',
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
