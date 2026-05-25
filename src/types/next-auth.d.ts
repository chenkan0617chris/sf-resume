// Augment next-auth's Session type so `session.user.id` / `tier` are typed.

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      tier: 'free' | 'pro';
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    tier?: 'free' | 'pro';
  }
}
