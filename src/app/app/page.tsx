// Dashboard placeholder. Real implementation lands W1D5+.

import { signOut } from '@/lib/auth';

export default async function AppHome() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900">SF Resume</h1>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Sign out
            </button>
          </form>
        </header>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-900">Dashboard</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Step 1-4 wizard wires up here in week 2. Resume CRUD & application
            history land first.
          </p>
        </div>
      </div>
    </div>
  );
}
