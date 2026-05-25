// Server-rendered sign-in button. Triggers Google OAuth via Auth.js.

import { signIn } from '@/lib/auth';

export default function SignInButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/app' });
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-3 rounded-full bg-zinc-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#fff"
            d="M21.6 12.227c0-.682-.061-1.337-.175-1.966H12v3.72h5.385a4.604 4.604 0 0 1-1.997 3.022v2.51h3.233c1.892-1.742 2.98-4.31 2.98-7.286z"
          />
          <path
            fill="#fff"
            d="M12 22c2.7 0 4.964-.895 6.62-2.426l-3.232-2.51c-.896.6-2.04.957-3.388.957-2.605 0-4.81-1.76-5.598-4.124H3.073v2.59A9.997 9.997 0 0 0 12 22z"
          />
          <path
            fill="#fff"
            d="M6.402 13.897a5.992 5.992 0 0 1 0-3.793V7.514H3.073a10 10 0 0 0 0 8.972l3.329-2.59z"
          />
          <path
            fill="#fff"
            d="M12 5.98c1.469 0 2.787.505 3.825 1.498l2.867-2.867C16.96 3.025 14.695 2 12 2 8.034 2 4.6 4.27 3.073 7.514l3.329 2.59C7.19 7.74 9.395 5.98 12 5.98z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
