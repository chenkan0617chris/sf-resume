// GET  /api/resume       — list current user's resumes
// POST /api/resume       — create a new resume

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });
  return NextResponse.json({ resumes });
}

interface CreateBody {
  label?: string;
  source?: 'pdf' | 'form';
  markdown: string;
  structuredJson?: unknown;
  isDefault?: boolean;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body.markdown?.trim()) {
    return NextResponse.json({ error: 'markdown is required' }, { status: 400 });
  }

  // If isDefault, unset the previous default in a transaction.
  const created = await prisma.$transaction(async (tx) => {
    if (body.isDefault) {
      await tx.resume.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.resume.create({
      data: {
        userId: session.user.id,
        label: body.label || 'Untitled Resume',
        source: body.source === 'pdf' ? 'pdf' : 'form',
        markdown: body.markdown,
        // Prisma's Json field accepts any JSON-serializable value at runtime.
        // The 'any' below isolates that loose typing to this single line.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        structuredJson: (body.structuredJson ?? null) as any,
        isDefault: !!body.isDefault,
      },
    });
  });

  return NextResponse.json({ resume: created });
}
