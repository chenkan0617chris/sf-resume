import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  engine: 'classic',
  datasource: {
    // url comes from schema.prisma → env("DATABASE_URL") for runtime
    url: process.env.DATABASE_URL!,
    // directUrl is no longer allowed in schema.prisma — configure here instead
    // Used by `prisma migrate` to bypass pgBouncer (port 5432 direct connection)
    directUrl: process.env.DIRECT_URL,
  },
});
