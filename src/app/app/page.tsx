import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AppHome() {
  const session = await auth();
  if (!session?.user) redirect('/');

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900">
        Welcome back, {session.user.name?.split(' ')[0] || 'there'}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/app/new"
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-2xl">✦</span>
          <span className="font-medium text-zinc-900">New Application</span>
          <span className="text-sm text-zinc-500">
            Tailor your resume to a job description and export a PDF.
          </span>
        </Link>
        <Link
          href="/app/resumes"
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="text-2xl">📄</span>
          <span className="font-medium text-zinc-900">My Resumes</span>
          <span className="text-sm text-zinc-500">
            Upload or edit your base resumes.
          </span>
        </Link>
      </div>
    </main>
  );
}
