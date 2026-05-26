// Single-column sans-serif resume matching the Kan Chen HTML template format.
// Centered name header, uppercase section titles with 1.5px black rule,
// categorised skills bullets, company-on-top work entries, project tech stack lines.

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { pickFonts, type RenderLang } from './shared';
import type { StructuredResume } from './types';

interface KanTemplateProps {
  resume: StructuredResume;
  lang?: RenderLang;
}

function makeStyles(lang: RenderLang) {
  const fonts = pickFonts(lang);
  return StyleSheet.create({
    page: {
      fontFamily: fonts.sans,
      fontSize: 10.5,
      color: '#000',
      paddingTop: 28,
      paddingBottom: 28,
      paddingHorizontal: 36,
      lineHeight: 1.4,
    },
    // ── Header ──
    header: { alignItems: 'center', marginBottom: 10 },
    headerName: { fontSize: 22, fontWeight: 'bold', letterSpacing: 2, marginBottom: 4 },
    headerContact: { fontSize: 9.5, color: '#222', textAlign: 'center' },
    // ── Section ──
    section: { marginTop: 10 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderBottomWidth: 1.5,
      borderBottomColor: '#000',
      paddingBottom: 2,
      marginBottom: 6,
    },
    // ── Skills ──
    skillBullet: { flexDirection: 'row', marginBottom: 2 },
    skillDot: { width: 14, fontSize: 10 },
    skillText: { flex: 1, fontSize: 10 },
    // ── Work experience ──
    jobEntry: { marginBottom: 10 },
    jobCompany: { fontWeight: 'bold', fontSize: 10.5 },
    jobRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    jobTitle: { fontSize: 10, color: '#222' },
    jobDate: { fontSize: 10, color: '#222' },
    // ── Shared bullets (job + project) ──
    bullet: { flexDirection: 'row', marginBottom: 2, marginTop: 1 },
    bulletDot: { width: 14, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10 },
    // ── Projects ──
    projectEntry: { marginBottom: 10 },
    projectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    projectName: { fontWeight: 'bold', fontSize: 10.5 },
    projectDate: { fontSize: 10, color: '#222' },
    projectTech: { fontSize: 10, marginTop: 1, marginBottom: 1 },
    projectAchieve: { fontWeight: 'bold', fontSize: 10 },
    projectWebsite: { fontSize: 10, marginTop: 2 },
    // ── Education ──
    eduEntry: { marginBottom: 6 },
    eduRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    eduSchool: { fontWeight: 'bold', fontSize: 10.5 },
    eduDate: { fontSize: 10, color: '#222' },
    eduDegree: { fontSize: 10 },
  });
}

function labelsFor(lang: RenderLang) {
  return lang === 'zh'
    ? {
        summary: '摘要',
        skills: '技术技能',
        experience: '工作经历',
        projects: '项目经验',
        education: '教育背景',
        certifications: '证书',
        keyAchievement: '主要成就：',
        website: '网站：',
      }
    : {
        summary: 'Summary',
        skills: 'Technical Skill',
        experience: 'Work Experience',
        projects: 'Project Experience',
        education: 'Education',
        certifications: 'Certifications',
        keyAchievement: 'Key Achievement:',
        website: 'Website:',
      };
}

function Bullets({
  items,
  s,
}: {
  items: string[] | undefined;
  s: ReturnType<typeof makeStyles>;
}) {
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

export default function KanTemplate({ resume, lang = 'en' }: KanTemplateProps) {
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
    skillCategories,
  } = resume;

  const line1 = [basics.phone, basics.email, basics.location].filter(Boolean).join(' | ');
  const line2 = basics.linkedin ? `LinkedIn: ${basics.linkedin}` : '';

  const flatSkills = [...(skills.technical || []), ...(skills.soft || [])];

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          {basics.name ? (
            <Text style={s.headerName}>{basics.name.toUpperCase()}</Text>
          ) : null}
          {line1 ? <Text style={s.headerContact}>{line1}</Text> : null}
          {line2 ? <Text style={s.headerContact}>{line2}</Text> : null}
        </View>

        {/* ── Summary ── */}
        {summary ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{L.summary}</Text>
            <Text style={{ fontSize: 10 }}>{summary}</Text>
          </View>
        ) : null}

        {/* ── Technical Skills ── */}
        {(skillCategories && skillCategories.length) || flatSkills.length ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{L.skills}</Text>
            {skillCategories && skillCategories.length
              ? skillCategories.map((cat, i) => (
                  <View key={i} style={s.skillBullet}>
                    <Text style={s.skillDot}>•</Text>
                    <Text style={s.skillText}>
                      <Text style={{ fontWeight: 'bold' }}>{cat.label}: </Text>
                      {cat.items.join(', ')}
                    </Text>
                  </View>
                ))
              : flatSkills.map((sk, i) => (
                  <View key={i} style={s.skillBullet}>
                    <Text style={s.skillDot}>•</Text>
                    <Text style={s.skillText}>{sk}</Text>
                  </View>
                ))}
          </View>
        ) : null}

        {/* ── Work Experience ── */}
        {experience.length ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{L.experience}</Text>
            {experience.map((e, i) => (
              <View key={i} style={s.jobEntry} wrap={false}>
                {e.company ? <Text style={s.jobCompany}>{e.company}</Text> : null}
                <View style={s.jobRow}>
                  <Text style={s.jobTitle}>{e.title || ''}</Text>
                  {(e.start || e.end) ? (
                    <Text style={s.jobDate}>
                      {[e.start, e.end].filter(Boolean).join(' - ')}
                    </Text>
                  ) : null}
                </View>
                <Bullets items={e.bullets} s={s} />
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Project Experience ── */}
        {projects.length ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{L.projects}</Text>
            {projects.map((p, i) => {
              const descLines = p.description
                ? p.description.split('\n').filter(Boolean)
                : [];
              const techLine = descLines.find((l) => /^tech stack:/i.test(l));
              const otherDesc = descLines
                .filter((l) => !/^tech stack:/i.test(l))
                .join(' ');
              const techValue = techLine
                ? techLine.replace(/^tech stack:\s*/i, '')
                : null;

              return (
                <View key={i} style={s.projectEntry} wrap={false}>
                  <View style={s.projectRow}>
                    <Text style={s.projectName}>{p.name}</Text>
                    {(p.start || p.end) ? (
                      <Text style={s.projectDate}>
                        {[p.start, p.end].filter(Boolean).join(' - ')}
                      </Text>
                    ) : null}
                  </View>
                  {techValue ? (
                    <Text style={s.projectTech}>
                      <Text style={{ fontWeight: 'bold' }}>Tech Stack: </Text>
                      {techValue}
                    </Text>
                  ) : otherDesc ? (
                    <Text style={s.projectTech}>{otherDesc}</Text>
                  ) : null}
                  {p.bullets && p.bullets.length ? (
                    <View>
                      <Text style={s.projectAchieve}>{L.keyAchievement}</Text>
                      <Bullets items={p.bullets} s={s} />
                    </View>
                  ) : null}
                  {p.link ? (
                    <Text style={s.projectWebsite}>
                      <Text style={{ fontWeight: 'bold' }}>Website: </Text>
                      {p.link}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ── Education ── */}
        {education.length ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{L.education}</Text>
            {education.map((ed, i) => (
              <View key={i} style={s.eduEntry} wrap={false}>
                <View style={s.eduRow}>
                  <Text style={s.eduSchool}>{ed.school || ''}</Text>
                  {(ed.start || ed.end) ? (
                    <Text style={s.eduDate}>
                      {[ed.start, ed.end].filter(Boolean).join(' - ')}
                    </Text>
                  ) : null}
                </View>
                {ed.degree ? <Text style={s.eduDegree}>{ed.degree}</Text> : null}
                {ed.major ? <Text style={s.eduDegree}>{ed.major}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Certifications ── */}
        {certifications.length ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{L.certifications}</Text>
            {certifications.map((c, i) => (
              <View key={i} style={s.skillBullet}>
                <Text style={s.skillDot}>•</Text>
                <Text style={s.skillText}>
                  {c.name}
                  {c.issuer ? ` — ${c.issuer}` : ''}
                  {c.date ? ` (${c.date})` : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
