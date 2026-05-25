// Shared infrastructure for PDF templates: font registration (incl. CJK),
// design tokens, react-pdf primitives, and the markdown → structured parser.

import { Font, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import type {
  StructuredResume,
  ResumeProject,
} from './types';

export type RenderLang = 'en' | 'zh';

// ─── Font registration ───────────────────────────────────────────────────
// Built-in PDF fonts (Helvetica, Times-Roman, Courier) have no CJK glyphs.
// For Chinese output we register Noto Sans SC + Noto Serif SC (open source).
// Place the TTF files in `public/pdf-fonts/`:
//   NotoSansSC-Regular.ttf, NotoSansSC-Bold.ttf,
//   NotoSerifSC-Regular.ttf, NotoSerifSC-Bold.ttf
// Then call `registerCjkFonts(baseUrl)` once per process before rendering.

let cjkRegistered = false;
export function registerCjkFonts(baseUrl: string): void {
  if (cjkRegistered) return;
  const base = baseUrl.replace(/\/$/, '');
  try {
    Font.register({
      family: 'NotoSansSC',
      fonts: [
        { src: `${base}/pdf-fonts/NotoSansSC-Regular.ttf`, fontWeight: 'normal' },
        { src: `${base}/pdf-fonts/NotoSansSC-Bold.ttf`, fontWeight: 'bold' },
      ],
    });
    Font.register({
      family: 'NotoSerifSC',
      fonts: [
        { src: `${base}/pdf-fonts/NotoSerifSC-Regular.ttf`, fontWeight: 'normal' },
        { src: `${base}/pdf-fonts/NotoSerifSC-Bold.ttf`, fontWeight: 'bold' },
      ],
    });
    cjkRegistered = true;
  } catch {
    // If font files are missing, fall back to built-ins — Chinese will render
    // as boxes, which is visible and tells the user fonts need installing.
  }
}

/** Pick the right serif/sans family pair for a given language. */
export function pickFonts(lang: RenderLang): {
  serif: string;
  serifBold: string;
  sans: string;
  sansBold: string;
} {
  if (lang === 'zh') {
    return {
      serif: 'NotoSerifSC',
      serifBold: 'NotoSerifSC',
      sans: 'NotoSansSC',
      sansBold: 'NotoSansSC',
    };
  }
  return {
    serif: 'Times-Roman',
    serifBold: 'Times-Bold',
    sans: 'Helvetica',
    sansBold: 'Helvetica-Bold',
  };
}

// ─── Design tokens ───────────────────────────────────────────────────────
export const COLORS = {
  primary: '#1e3a5f',
  text: '#111',
  muted: '#666',
  light: '#9bb4d6',
} as const;

export const PAGE = {
  size: 'A4' as const,
  padding: 36,
};

// ─── Section heading primitive ───────────────────────────────────────────
const sharedStyles = StyleSheet.create({
  sectionHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  },
  sectionRule: {
    borderBottomWidth: 0.5,
    borderBottomStyle: 'solid',
    marginBottom: 6,
  },
});

export function SectionHeading({
  text,
  color,
  rule = false,
  style,
}: {
  text: string;
  color?: string;
  rule?: boolean;
  style?: object;
}): ReactNode {
  // react-pdf's Style type rejects arrays containing optional `null`s, so we
  // merge into a single object instead of building a Style[] array.
  const headingStyle = {
    ...sharedStyles.sectionHeading,
    ...(color ? { color } : null),
    ...(style || null),
  };
  return (
    <View>
      <Text style={headingStyle}>{text}</Text>
      {rule ? (
        <View
          style={{
            ...sharedStyles.sectionRule,
            borderBottomColor: color || COLORS.text,
          }}
        />
      ) : null}
    </View>
  );
}

// ─── parseResumeMarkdown ─────────────────────────────────────────────────
// Heuristic markdown → structured resume parser. Tolerant of variation in
// bolding, separators, and date formats. Handles both English and Chinese
// section headings (the rewrite prompt uses 摘要 / 工作经历 / 教育背景 etc.
// for Chinese output).

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const LINKEDIN_RE = /((?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|·•]+)/i;
const URL_RE = /(https?:\/\/[^\s|·•]+)/i;

const DATE_RE =
  /((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}(?:[/-]\d{1,2})?|Present|Current|Now|至今)/i;

const SEPARATOR_RE = /\s*[·•|–—-]\s*/;

type SectionKey =
  | 'basics'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'other';

const HEADING_MAP: Record<string, SectionKey> = {
  // English
  summary: 'summary',
  profile: 'summary',
  about: 'summary',
  objective: 'summary',
  experience: 'experience',
  'work experience': 'experience',
  'professional experience': 'experience',
  work: 'experience',
  employment: 'experience',
  education: 'education',
  skills: 'skills',
  'technical skills': 'skills',
  'core skills': 'skills',
  projects: 'projects',
  'selected projects': 'projects',
  certifications: 'certifications',
  certificates: 'certifications',
  certification: 'certifications',
  // Chinese (matching rewritePrompt.ts Chinese headings)
  摘要: 'summary',
  简介: 'summary',
  '个人简介': 'summary',
  '工作经历': 'experience',
  '工作经验': 'experience',
  '专业经历': 'experience',
  '教育背景': 'education',
  '教育经历': 'education',
  教育: 'education',
  技能: 'skills',
  '专业技能': 'skills',
  '项目经验': 'projects',
  '项目经历': 'projects',
  项目: 'projects',
  证书: 'certifications',
  资质: 'certifications',
};

function stripBold(line: string): string {
  return line.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1');
}

function stripMarkdownInline(line: string): string {
  return stripBold(line)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function classifyHeading(text: string): SectionKey | null {
  const norm = text.trim().toLowerCase().replace(/[:：]$/, '');
  return HEADING_MAP[norm] ?? HEADING_MAP[text.trim().replace(/[:：]$/, '')] ?? null;
}

function parseContactLine(line: string): Partial<StructuredResume['basics']> {
  const out: Partial<StructuredResume['basics']> = {};
  const email = line.match(EMAIL_RE);
  if (email) out.email = email[0];
  const linkedin = line.match(LINKEDIN_RE);
  if (linkedin) out.linkedin = linkedin[0];

  let scratch = line;
  if (email) scratch = scratch.replace(email[0], '');
  if (linkedin) scratch = scratch.replace(linkedin[0], '');
  const phone = scratch.match(PHONE_RE);
  if (phone) out.phone = phone[0].trim();

  const remaining = scratch
    .split(SEPARATOR_RE)
    .map((t) => t.trim())
    .filter(
      (t) =>
        t &&
        !EMAIL_RE.test(t) &&
        !PHONE_RE.test(t) &&
        !LINKEDIN_RE.test(t) &&
        !URL_RE.test(t)
    );
  if (remaining.length) out.location = remaining[0];

  return out;
}

interface DateInfo {
  match: string;
  start: string;
  end: string;
}

function extractDateRange(line: string): DateInfo | null {
  const m = line.match(
    /((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}(?:[/-]\d{1,2})?)\s*[–—-]\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}(?:[/-]\d{1,2})?|Present|Current|Now|至今)/i
  );
  if (m) {
    return { match: m[0], start: m[1].trim(), end: m[2].trim() };
  }
  const single = line.match(DATE_RE);
  if (single) return { match: single[0], start: single[0].trim(), end: '' };
  return null;
}

function parseExperienceHeader(rawLine: string): Omit<StructuredResume['experience'][number], 'bullets'> {
  const dateInfo = extractDateRange(rawLine);
  let line = rawLine;
  let start = '';
  let end = '';
  if (dateInfo) {
    start = dateInfo.start;
    end = dateInfo.end;
    line = line.replace(dateInfo.match, '').trim();
  }
  line = stripMarkdownInline(line).replace(/[,·•|–—-]\s*$/, '').trim();

  const parts = line
    .split(SEPARATOR_RE)
    .map((t) => t.trim())
    .filter(Boolean);

  let title = '';
  let company = '';
  if (parts.length === 1) title = parts[0];
  else if (parts.length >= 2) {
    title = parts[0];
    company = parts[1];
  }
  return { title, company, start, end };
}

function parseEducationHeader(rawLine: string): StructuredResume['education'][number] {
  const dateInfo = extractDateRange(rawLine);
  let line = rawLine;
  let start = '';
  let end = '';
  if (dateInfo) {
    start = dateInfo.start;
    end = dateInfo.end;
    line = line.replace(dateInfo.match, '').trim();
  }
  line = stripMarkdownInline(line).replace(/[,·•|–—-]\s*$/, '').trim();

  let parts = line.split(SEPARATOR_RE).map((t) => t.trim()).filter(Boolean);
  if (parts.length < 2) {
    parts = line.split(/\s*,\s*/).map((t) => t.trim()).filter(Boolean);
  }
  if (parts.length < 2 && /\s+at\s+/i.test(line)) {
    parts = line.split(/\s+at\s+/i).map((t) => t.trim()).filter(Boolean);
  }

  return {
    school: parts[1] || '',
    degree: parts[0] || '',
    major: '',
    start,
    end,
    gpa: '',
  };
}

function tokenizeSkills(text: string): string[] {
  return text
    .split(/[,;、·•|]/)
    .map((t) => stripMarkdownInline(t).trim())
    .filter(Boolean);
}

function isBulletLine(line: string): boolean {
  return /^\s*[-*]\s+/.test(line);
}

function bulletText(line: string): string {
  return stripMarkdownInline(line.replace(/^\s*[-*]\s+/, '')).trim();
}

function looksLikeEntryHeader(line: string): boolean {
  if (!line.trim()) return false;
  if (isBulletLine(line)) return false;
  if (/\*\*[^*]+\*\*/.test(line)) return true;
  if (/[·•|]/.test(line)) return true;
  if (extractDateRange(line)) return true;
  return false;
}

function emptyResume(): StructuredResume {
  return {
    basics: { name: '', email: '', phone: '', linkedin: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
  };
}

// Internal type holding the _closed flag while parsing projects.
interface ProjectDraft extends ResumeProject {
  _closed?: boolean;
}

/**
 * Parse a Markdown resume into the structured shape. Returns `null` if the
 * result is unusable (no name AND no sections), signaling the caller to fall
 * back to PlainTextTemplate.
 */
export function parseResumeMarkdown(md: string): StructuredResume | null {
  if (typeof md !== 'string' || !md.trim()) return null;

  const resume = emptyResume();
  const projects: ProjectDraft[] = [];
  const lines = md.replace(/\r\n?/g, '\n').split('\n');

  let section: SectionKey = 'basics';
  let skillsSub: 'technical' | 'soft' = 'technical';
  let currentEntry: StructuredResume['experience'][number] | null = null;
  let currentEdu: StructuredResume['education'][number] | null = null;
  const summaryBuf: string[] = [];
  const basicsBuf: string[] = [];

  const finalizeEntry = () => {
    if (currentEntry) {
      resume.experience.push(currentEntry);
      currentEntry = null;
    }
  };
  const finalizeEdu = () => {
    if (currentEdu) {
      resume.education.push(currentEdu);
      currentEdu = null;
    }
  };
  const finalizeAll = () => {
    finalizeEntry();
    finalizeEdu();
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1 && !resume.basics.name) {
      resume.basics.name = stripMarkdownInline(h1[1]).trim();
      section = 'basics';
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      finalizeAll();
      if (basicsBuf.length) {
        const merged = basicsBuf.join(' ');
        const parsed = parseContactLine(merged);
        resume.basics = {
          ...resume.basics,
          email: resume.basics.email || parsed.email || '',
          phone: resume.basics.phone || parsed.phone || '',
          linkedin: resume.basics.linkedin || parsed.linkedin || '',
          location: resume.basics.location || parsed.location || '',
        };
        basicsBuf.length = 0;
      }
      const next = classifyHeading(stripMarkdownInline(h2[1]));
      section = next || 'other';
      skillsSub = 'technical';
      continue;
    }

    if (section === 'skills') {
      const subMatch =
        line.match(/^###\s+(.+)$/) ||
        line.match(/^\*\*([^*]+)\*\*\s*[:：]?\s*(.*)$/);
      if (subMatch) {
        const label = subMatch[1].toLowerCase();
        if (/soft|软/.test(label)) {
          skillsSub = 'soft';
        } else if (/technical|tech|hard|tools|languages|技术|硬技能/.test(label)) {
          skillsSub = 'technical';
        }
        const inlineRest = (subMatch[2] || '').trim();
        if (inlineRest) {
          resume.skills[skillsSub].push(...tokenizeSkills(inlineRest));
        }
        continue;
      }
    }

    switch (section) {
      case 'basics': {
        basicsBuf.push(stripMarkdownInline(line));
        break;
      }

      case 'summary': {
        summaryBuf.push(stripMarkdownInline(line));
        break;
      }

      case 'experience': {
        if (isBulletLine(raw)) {
          if (!currentEntry) {
            currentEntry = {
              company: '',
              title: '',
              start: '',
              end: '',
              bullets: [],
            };
          }
          currentEntry.bullets.push(bulletText(raw));
        } else if (looksLikeEntryHeader(line)) {
          finalizeEntry();
          const header = parseExperienceHeader(line);
          currentEntry = { ...header, bullets: [] };
        } else if (currentEntry) {
          currentEntry.bullets.push(stripMarkdownInline(line));
        }
        break;
      }

      case 'education': {
        if (isBulletLine(raw)) {
          if (!currentEdu) {
            currentEdu = {
              school: '',
              degree: '',
              major: '',
              start: '',
              end: '',
              gpa: '',
            };
          }
          const txt = bulletText(raw);
          if (!currentEdu.major) currentEdu.major = txt;
          else currentEdu.degree = `${currentEdu.degree} — ${txt}`.trim();
        } else if (looksLikeEntryHeader(line) || line.length > 0) {
          finalizeEdu();
          currentEdu = parseEducationHeader(line);
        }
        break;
      }

      case 'skills': {
        if (isBulletLine(raw)) {
          resume.skills[skillsSub].push(...tokenizeSkills(bulletText(raw)));
        } else {
          const labelled = line.match(/^([A-Za-z一-鿿][\w\s一-鿿]+?)\s*[:：]\s*(.*)$/);
          if (labelled) {
            const label = labelled[1].toLowerCase();
            if (/soft|软/.test(label)) skillsSub = 'soft';
            else if (/technical|tech|hard|tools|languages|技术|硬技能/.test(label))
              skillsSub = 'technical';
            resume.skills[skillsSub].push(...tokenizeSkills(labelled[2]));
          } else {
            resume.skills[skillsSub].push(...tokenizeSkills(line));
          }
        }
        break;
      }

      case 'projects': {
        if (isBulletLine(raw)) {
          const text = bulletText(raw);
          if (!projects.length || projects[projects.length - 1]._closed) {
            projects.push({
              name: text.split(/[—:·-]/)[0].trim() || text,
              description: '',
              bullets: [text],
              link: '',
            });
          } else {
            const last = projects[projects.length - 1];
            last.bullets.push(text);
          }
        } else if (looksLikeEntryHeader(line)) {
          if (projects.length) projects[projects.length - 1]._closed = true;
          const dateInfo = extractDateRange(line);
          let cleaned = line;
          if (dateInfo) cleaned = cleaned.replace(dateInfo.match, '').trim();
          cleaned = stripMarkdownInline(cleaned)
            .replace(/[,·•|–—-]\s*$/, '')
            .trim();
          const linkMatch = cleaned.match(URL_RE);
          const name = cleaned.replace(URL_RE, '').split(SEPARATOR_RE)[0].trim();
          projects.push({
            name: name || cleaned,
            description: '',
            bullets: [],
            link: linkMatch ? linkMatch[0] : '',
          });
        } else if (line.length > 0 && projects.length) {
          // Metadata / continuation line (e.g. "*Tech Stack: …*") — attach to
          // current project's description rather than spawning a phantom entry.
          const meta = stripMarkdownInline(line).trim();
          if (meta) {
            const last = projects[projects.length - 1];
            last.description = last.description
              ? `${last.description}\n${meta}`
              : meta;
          }
        }
        break;
      }

      case 'certifications': {
        const text = isBulletLine(raw) ? bulletText(raw) : stripMarkdownInline(line);
        if (!text) break;
        const dateInfo = extractDateRange(text);
        let body = text;
        let date = '';
        if (dateInfo) {
          date = dateInfo.match;
          body = body.replace(dateInfo.match, '').trim();
        }
        body = body.replace(/[,·•|–—-]\s*$/, '').trim();
        const parts = body.split(SEPARATOR_RE).map((t) => t.trim()).filter(Boolean);
        resume.certifications.push({
          name: parts[0] || body,
          issuer: parts[1] || '',
          date,
        });
        break;
      }

      default:
        break;
    }
  }

  finalizeAll();
  if (basicsBuf.length) {
    const merged = basicsBuf.join(' ');
    const parsed = parseContactLine(merged);
    resume.basics = {
      ...resume.basics,
      email: resume.basics.email || parsed.email || '',
      phone: resume.basics.phone || parsed.phone || '',
      linkedin: resume.basics.linkedin || parsed.linkedin || '',
      location: resume.basics.location || parsed.location || '',
    };
  }
  if (summaryBuf.length) {
    resume.summary = summaryBuf.join(' ').replace(/\s+/g, ' ').trim();
  }

  // Strip _closed before exposing.
  resume.projects = projects.map(({ _closed: _, ...rest }) => rest);

  // Dedupe skill tokens (case-insensitive).
  const dedupe = (arr: string[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of arr) {
      const key = s.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(s);
      }
    }
    return out;
  };
  resume.skills.technical = dedupe(resume.skills.technical);
  resume.skills.soft = dedupe(resume.skills.soft);

  const hasAnySection =
    resume.summary ||
    resume.experience.length ||
    resume.education.length ||
    resume.skills.technical.length ||
    resume.skills.soft.length ||
    resume.projects.length ||
    resume.certifications.length;

  if (!resume.basics.name || !hasAnySection) return null;

  return resume;
}
