import { NextResponse } from 'next/server';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { auth } from '@/lib/auth';
import { parseResumeMarkdown } from '@/lib/pdf-templates/shared';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface DocxBody {
  markdown: string;
}

function hr(): Paragraph {
  return new Paragraph({ text: '', spacing: { before: 100, after: 100 } });
}

function heading(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
}

function bold(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, bold: true })] });
}

function italic(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun({ text, italics: true })] });
}

function bullet(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun(text)], bullet: { level: 0 } });
}

function plain(text: string): Paragraph {
  return new Paragraph({ text });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: DocxBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.markdown?.trim()) {
    return NextResponse.json({ error: 'markdown is required' }, { status: 400 });
  }

  const resume = parseResumeMarkdown(body.markdown);
  if (!resume) {
    return NextResponse.json(
      { error: 'PARSE_FAILED', message: 'Could not parse resume structure from markdown' },
      { status: 400 }
    );
  }

  const children: Paragraph[] = [];

  // Name
  children.push(
    new Paragraph({
      text: resume.basics.name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );

  // Contact line
  const contactParts = [
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location,
    resume.basics.linkedin,
  ].filter(Boolean);
  if (contactParts.length) {
    children.push(
      new Paragraph({
        text: contactParts.join('  |  '),
        alignment: AlignmentType.CENTER,
      })
    );
  }

  // Summary
  if (resume.summary) {
    children.push(hr(), heading('Summary'));
    children.push(plain(resume.summary));
  }

  // Experience
  if (resume.experience.length) {
    children.push(hr(), heading('Experience'));
    for (const exp of resume.experience) {
      const dateStr = [exp.start, exp.end].filter(Boolean).join(' – ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true }),
            ...(exp.company ? [new TextRun({ text: `  —  ${exp.company}` })] : []),
          ],
        })
      );
      if (dateStr) children.push(italic(dateStr));
      for (const b of exp.bullets) {
        children.push(bullet(b));
      }
    }
  }

  // Education
  if (resume.education.length) {
    children.push(hr(), heading('Education'));
    for (const edu of resume.education) {
      const dateStr = [edu.start, edu.end].filter(Boolean).join(' – ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.school, bold: true }),
            ...(edu.degree ? [new TextRun({ text: `  —  ${edu.degree}` })] : []),
          ],
        })
      );
      if (edu.major) children.push(italic(edu.major));
      if (dateStr) children.push(italic(dateStr));
    }
  }

  // Skills
  const allSkills = [
    ...(resume.skillCategories?.flatMap((c) => c.items) ?? []),
    ...resume.skills.technical,
    ...resume.skills.soft,
  ];
  const deduped = [...new Set(allSkills)];
  if (deduped.length) {
    children.push(hr(), heading('Skills'));
    if (resume.skillCategories?.length) {
      for (const cat of resume.skillCategories) {
        children.push(bold(`${cat.label}: `));
        children.push(plain(cat.items.join(', ')));
      }
    } else {
      children.push(plain(deduped.join(', ')));
    }
  }

  // Projects
  if (resume.projects?.length) {
    children.push(hr(), heading('Projects'));
    for (const proj of resume.projects) {
      children.push(bold(proj.name));
      if (proj.description) children.push(italic(proj.description));
      for (const b of proj.bullets) {
        children.push(bullet(b));
      }
    }
  }

  // Certifications
  if (resume.certifications?.length) {
    children.push(hr(), heading('Certifications'));
    for (const cert of resume.certifications) {
      children.push(
        plain([cert.name, cert.issuer, cert.date].filter(Boolean).join('  —  '))
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="resume.docx"',
    },
  });
}
