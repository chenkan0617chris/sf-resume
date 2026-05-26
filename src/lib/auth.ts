// Auth.js v5 full config (Node.js only — imports Prisma).
// middleware.ts uses auth.config.ts instead to stay Edge-compatible.

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // JWT strategy: session token is a signed cookie, no DB lookup needed
  // in middleware. User + Account rows still written by PrismaAdapter on
  // first sign-in. Switch to 'database' later if server-side revocation matters.
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only present on the first sign-in (from the DB via adapter).
      if (user) {
        token.id = user.id;
        token.tier = (user as { tier?: string }).tier ?? 'free';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-expect-error — augmenting next-auth types
        session.user.tier = token.tier ?? 'free';
      }
      return session;
    },
  },
});
