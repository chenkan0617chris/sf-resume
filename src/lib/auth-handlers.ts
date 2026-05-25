// Re-export Auth.js's GET/POST handlers. Kept in a separate module so the
// dynamic route file under app/api/auth/[...nextauth]/ stays minimal.

import { handlers } from './auth';

export const { GET, POST } = handlers;
