import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const offset = Number(searchParams.get('offset') ?? 0);

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      company: true,
      role: true,
      outputLang: true,
      provider: true,
      model: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return NextResponse.json({ applications });
}

interface CreateApplicationBody {
  resumeId?: string;
  jdText: string;
  company?: string;
  role?: string;
  outputLang?: 'en' | 'zh';
  sourceMarkdown: string;
  analysisJson?: unknown;
  resultMarkdown?: string;
  provider: string;
  model: string;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateApplicationBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    !body.jdText?.trim() ||
    !body.sourceMarkdown?.trim() ||
    !body.provider?.trim() ||
    !body.model?.trim()
  ) {
    return NextResponse.json(
      { error: 'jdText, sourceMarkdown, provider, and model are required' },
      { status: 400 }
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      resumeId: body.resumeId ?? null,
      jdText: body.jdText,
      company: body.company ?? null,
      role: body.role ?? null,
      outputLang: body.outputLang === 'zh' ? 'zh' : 'en',
      sourceMarkdown: body.sourceMarkdown,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analysisJson: (body.analysisJson ?? null) as any,
      resultMarkdown: body.resultMarkdown ?? null,
      provider: body.provider,
      model: body.model,
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
