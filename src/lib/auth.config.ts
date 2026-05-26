// Edge-safe auth config — no Prisma imports. Used by middleware.ts.
// The full config (with PrismaAdapter) lives in auth.ts.

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: { signIn: '/' },
};
