// Single-column serif resume PDF. Centered name header with a thin underline,
// uppercase section labels with light letterspacing.

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  COLORS,
  PAGE,
  SectionHeading,
  pickFonts,
  type RenderLang,
} from './shared';
import type { StructuredResume } from './types';

interface ClassicTemplateProps {
  resume: StructuredResume;
  lang?: RenderLang;
}

function makeStyles(lang: RenderLang) {
  const fonts = pickFonts(lang);
  return StyleSheet.create({
    page: {
      fontFamily: fonts.serif,
      fontSize: 10.5,
      color: COLORS.text,
      paddingTop: PAGE.padding,
      paddingBottom: PAGE.padding,
      paddingHorizontal: PAGE.padding,
      lineHeight: 1.4,
    },
    header: { alignItems: 'center', marginBottom: 12 },
    name: { fontSize: 22, letterSpacing: 1, marginBottom: 4 },
    contact: { fontSize: 10, color: COLORS.muted },
    rule: {
      borderBottomWidth: 0.75,
      borderBottomColor: COLORS.text,
      marginTop: 8,
      marginBottom: 4,
      width: '100%',
    },
    paragraph: { marginBottom: 6 },
    entry: { marginBottom: 8 },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    entryTitle: { fontSize: 11 },
    entryDates: { fontSize: 10, color: COLORS.muted },
    entrySub: { fontSize: 10, color: COLORS.muted, marginBottom: 3 },
    bullet: { flexDirection: 'row', marginBottom: 2 },
    bulletDot: { width: 10, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10.5 },
  });
}

function Bullets({ items, s }: { items: string[] | undefined; s: ReturnType<typeof makeStyles> }) {
  if (!items || !items.length) return null;
  return (
    <View>
      {items.map((b, i) => (
        <View key={i} style={s.bullet}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <SectionHeading text={title} rule />
      {children}
    </View>
  );
}

function labelsFor(lang: RenderLang) {
  return lang === 'zh'
    ? {
        summary: '摘要',
        experience: '工作经历',
        education: '教育背景',
        skills: '技能',
        projects: '项目经验',
        certifications: '证书',
      }
    : {
        summary: 'Summary',
        experience: 'Experience',
        education: 'Education',
        skills: 'Skills',
        projects: 'Projects',
        certifications: 'Certifications',
      };
}

export default function ClassicTemplate({
  resume,
  lang = 'en',
}: ClassicTemplateProps) {
  if (!resume) return null;
  const s = makeStyles(lang);
  const L = labelsFor(lang);
  const {
    basics,
    summary,
    experience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certifications = [],
  } = resume;

  const contactParts = [basics.email, basics.phone, basics.linkedin, basics.location].filter(Boolean);
  const skillTokens = [...(skills.technical || []), ...(skills.soft || [])];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {basics.name ? <Text style={s.name}>{basics.name}</Text> : null}
          {contactParts.length ? (
            <Text style={s.contact}>{contactParts.join('  ·  ')}</Text>
          ) : null}
          <View style={s.rule} />
        </View>

        {summary ? (
          <Section title={L.summary}>
            <Text style={s.paragraph}>{summary}</Text>
          </Section>
        ) : null}

        {experience.length ? (
          <Section title={L.experience}>
            {experience.map((e, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryHeader}>
                  <Text style={s.entryTitle}>
                    {e.title || ''}
                    {e.company ? `, ${e.company}` : ''}
                  </Text>
                  {(e.start || e.end) && (
                    <Text style={s.entryDates}>
                      {[e.start, e.end].filter(Boolean).join(' — ')}
                    </Text>
                  )}
                </View>
                <Bullets items={e.bullets} s={s} />
              </View>
            ))}
          </Section>
        ) : null}

        {education.length ? (
          <Section title={L.education}>
            {education.map((ed, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <View style={s.entryHeader}>
                  <Text style={s.entryTitle}>
                    {ed.degree || ''}
                    {ed.school ? `, ${ed.school}` : ''}
                  </Text>
                  {(ed.start || ed.end) && (
                    <Text style={s.entryDates}>
                      {[ed.start, ed.end].filter(Boolean).join(' — ')}
                    </Text>
                  )}
                </View>
                {ed.major ? <Text style={s.entrySub}>{ed.major}</Text> : null}
                {ed.gpa ? <Text style={s.entrySub}>GPA: {ed.gpa}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {skillTokens.length ? (
          <Section title={L.skills}>
            <Text style={s.paragraph}>{skillTokens.join(' · ')}</Text>
          </Section>
        ) : null}

        {projects.length ? (
          <Section title={L.projects}>
            {projects.map((p, i) => (
              <View key={i} style={s.entry} wrap={false}>
                <Text style={s.entryTitle}>{p.name}</Text>
                {p.description ? <Text style={s.entrySub}>{p.description}</Text> : null}
                <Bullets items={p.bullets} s={s} />
                {p.link ? <Text style={s.entrySub}>{p.link}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {certifications.length ? (
          <Section title={L.certifications}>
            {certifications.map((c, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>
                  {c.name}
                  {c.issuer ? ` — ${c.issuer}` : ''}
                  {c.date ? ` (${c.date})` : ''}
                </Text>
              </View>
            ))}
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}
