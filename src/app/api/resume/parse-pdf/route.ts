// POST /api/resume/parse-pdf — accepts a PDF file (multipart/form-data field
// "file"), extracts plain text using pdfjs-dist, returns { text }.
//
// Phase 1 stub: actual implementation deferred to W1D5-7. Returns a 501 so
// the route exists in the build graph without yet requiring the heavyweight
// pdfjs-dist worker setup on the server.

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(
    { error: 'NOT_IMPLEMENTED', message: 'PDF parsing wires up in W1D5-7.' },
    { status: 501 }
  );
}
