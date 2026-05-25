// Route protection. Anything under /app/* or /api/* (except /api/auth/* and
// /api/stripe/webhook) requires a valid session.

import { auth } from '@/lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublicApi =
    pathname.startsWith('/api/auth') ||
    pathname === '/api/stripe/webhook';

  const requiresAuth =
    pathname.startsWith('/app') ||
    (pathname.startsWith('/api') && !isPublicApi);

  if (requiresAuth && !req.auth) {
    if (pathname.startsWith('/api')) {
      return new Response('Unauthorized', { status: 401 });
    }
    const url = new URL('/', req.nextUrl);
    url.searchParams.set('signin', '1');
    return Response.redirect(url);
  }
});

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
