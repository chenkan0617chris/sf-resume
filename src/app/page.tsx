// Landing page. Shows hero + sign-in CTA when logged out; redirects to /app
// when logged in.

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SignInButton from '@/components/auth/SignInButton';

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect('/app');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
          SF Resume
        </h1>
        <p className="max-w-xl text-lg leading-7 text-zinc-600">
          Tailor your resume to any job in seconds. Upload your resume + paste a
          job description, and get back an ATS-friendly PDF that matches.
        </p>
        <SignInButton />
        <ul className="mt-8 grid max-w-xl grid-cols-1 gap-4 text-left text-sm text-zinc-600 sm:grid-cols-3">
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong className="block text-zinc-900">Gap analysis</strong>
            See exactly what the JD wants that your resume lacks.
          </li>
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong className="block text-zinc-900">AI rewrite</strong>
            Stream a tailored Markdown resume you can edit live.
          </li>
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong className="block text-zinc-900">PDF export</strong>
            Vector, selectable text, ATS-parseable.
          </li>
        </ul>
      </main>
    </div>
  );
}
