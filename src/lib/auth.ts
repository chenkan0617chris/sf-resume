// Auth.js v5 configuration. Used by:
//   - `app/api/auth/[...nextauth]/route.ts` (HTTP handlers)
//   - middleware.ts (route protection)
//   - server actions / route handlers (`await auth()` to read session)
//
// Database session strategy: every request hits Postgres to look up the
// session, which keeps the cookie tiny and lets us revoke server-side.

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'database' },
  pages: { signIn: '/' },
  callbacks: {
    async session({ session, user }) {
      // Surface our app-specific fields (id, tier) on the session object.
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error — augmenting next-auth types below
        session.user.tier = (user as { tier?: string }).tier ?? 'free';
      }
      return session;
    },
  },
});
