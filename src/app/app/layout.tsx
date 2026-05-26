import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';

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

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/app" className="text-lg font-semibold text-zinc-900">
              SF Resume
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/app"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Dashboard
              </Link>
              <Link
                href="/app/resumes"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                My Resumes
              </Link>
              <Link href="/app/history" className="text-sm text-zinc-600 hover:text-zinc-900">History</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={displayName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
                  {initials}
                </div>
              )}
              <span className="text-sm text-zinc-700">{displayName}</span>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
