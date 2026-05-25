import type { NextConfig } from 'next';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles" warning by pinning the workspace root to
  // this project's directory. (C:\projects\ has an unrelated lockfile.)
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  // @react-pdf/renderer is published as ESM with internals that Webpack
  // tree-shakes oddly. Marking it server-external keeps it out of any client
  // bundle accidentally and avoids the warnings.
  serverExternalPackages: ['@react-pdf/renderer'],
};

export default nextConfig;
