import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { auth } from '@/lib/auth';
import {
  parseResumeMarkdown,
  registerCjkFonts,
  type RenderLang,
} from '@/lib/pdf-templates/shared';
import ClassicTemplate from '@/lib/pdf-templates/ClassicTemplate';
import ModernTemplate from '@/lib/pdf-templates/ModernTemplate';
import KanTemplate from '@/lib/pdf-templates/KanTemplate';
import React from 'react';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface PdfBody {
  markdown: string;
  template?: 'classic' | 'modern' | 'kan';
  lang?: 'en' | 'zh';
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: PdfBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.markdown?.trim()) {
    return NextResponse.json({ error: 'markdown is required' }, { status: 400 });
  }

  const lang: RenderLang = body.lang === 'zh' ? 'zh' : 'en';
  const template =
    body.template === 'modern' ? 'modern' : body.template === 'kan' ? 'kan' : 'classic';

  const resume = parseResumeMarkdown(body.markdown);
  if (!resume) {
    return NextResponse.json(
      { error: 'PARSE_FAILED', message: 'Could not parse resume structure from markdown' },
      { status: 400 }
    );
  }

  if (lang === 'zh') {
    registerCjkFonts(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000');
  }

  try {
    const element = (
      template === 'modern'
        ? React.createElement(ModernTemplate, { resume, lang })
        : template === 'kan'
          ? React.createElement(KanTemplate, { resume, lang })
          : React.createElement(ClassicTemplate, { resume, lang })
    ) as React.ReactElement<DocumentProps>;

    const buffer = await renderToBuffer(element);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'RENDER_FAILED', message: msg }, { status: 500 });
  }
}
