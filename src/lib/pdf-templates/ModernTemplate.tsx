import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import {
  COLORS,
  SectionHeading,
  pickFonts,
  type RenderLang,
} from './shared';
import type { StructuredResume } from './types';

interface ModernTemplateProps {
  resume: StructuredResume;
  lang?: RenderLang;
}

function makeStyles(lang: RenderLang) {
  const fonts = pickFonts(lang);
  return StyleSheet.create({
    page: {
      fontFamily: fonts.sans,
      fontSize: 10,
      color: COLORS.text,
      flexDirection: 'row',
    },
    sidebar: {
      width: '35%',
      backgroundColor: COLORS.primary,
      color: '#fff',
      paddingHorizontal: 18,
      paddingVertical: 24,
    },
    main: {
      width: '65%',
      paddingHorizontal: 20,
      paddingVertical: 24,
      backgroundColor: '#fff',
    },
    sideName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
    sideSectionTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: COLORS.light,
      marginTop: 14,
      marginBottom: 6,
    },
    sideText: { fontSize: 9, color: '#fff', marginBottom: 3, lineHeight: 1.4 },
    sideMuted: { fontSize: 9, color: COLORS.light, marginBottom: 6 },
    sideRule: {
      borderBottomWidth: 0.5,
      borderBottomColor: COLORS.light,
      marginBottom: 4,
    },
    sideEduEntry: { marginBottom: 8 },
    mainHeader: { marginBottom: 10 },
    paragraph: { marginBottom: 6, fontSize: 10, lineHeight: 1.45 },
    entry: { marginBottom: 9 },
    entryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    entryTitle: { fontSize: 10.5, fontWeight: 'bold', color: COLORS.text },
    entryCompany: { fontSize: 10, color: COLORS.primary },
    entryDates: { fontSize: 9, color: COLORS.muted },
    bullet: { flexDirection: 'row', marginBottom: 2, marginTop: 1 },
    bulletDot: { width: 9, fontSize: 10, color: COLORS.primary },
    bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
  });
}

function labelsFor(lang: RenderLang) {
  return lang === 'zh'
    ? {
        profile: '摘要',
        experience: '工作经历',
        projects: '项目经验',
        skills: '技能',
        softSkills: '软技能',
        education: '教育背景',
        certifications: '证书',
        contact: '联系方式',
      }
    : {
        profile: 'Profile',
        experience: 'Experience',
        projects: 'Projects',
        skills: 'Skills',
        softSkills: 'Soft Skills',
        education: 'Education',
        certifications: 'Certifications',
        contact: 'Contact',
      };
}

function MainBullets({
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

function SideSection({
  title,
  children,
  s,
}: {
  title: string;
  children: React.ReactNode;
  s: ReturnType<typeof makeStyles>;
}) {
  return (
    <View>
      <Text style={s.sideSectionTitle}>{title}</Text>
      <View style={s.sideRule} />
      {children}
    </View>
  );
}

export default function ModernTemplate({
  resume,
  lang = 'en',
}: ModernTemplateProps) {
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

  const hasContact = basics.email || basics.phone || basics.linkedin || basics.location;
  const hasTech = skills.technical && skills.technical.length;
  const hasSoft = skills.soft && skills.soft.length;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {basics.name ? <Text style={s.sideName}>{basics.name}</Text> : null}

          {hasContact ? (
            <SideSection title={L.contact} s={s}>
              {basics.email ? <Text style={s.sideText}>{basics.email}</Text> : null}
              {basics.phone ? <Text style={s.sideText}>{basics.phone}</Text> : null}
              {basics.linkedin ? <Text style={s.sideText}>{basics.linkedin}</Text> : null}
              {basics.location ? <Text style={s.sideText}>{basics.location}</Text> : null}
            </SideSection>
          ) : null}

          {hasTech ? (
            <SideSection title={L.skills} s={s}>
              <Text style={s.sideText}>{skills.technical.join(' · ')}</Text>
            </SideSection>
          ) : null}

          {hasSoft ? (
            <SideSection title={L.softSkills} s={s}>
              <Text style={s.sideText}>{skills.soft.join(' · ')}</Text>
            </SideSection>
          ) : null}

          {education.length ? (
            <SideSection title={L.education} s={s}>
              {education.map((ed, i) => (
                <View key={i} style={s.sideEduEntry}>
                  {ed.degree ? (
                    <Text style={{ ...s.sideText, fontWeight: 'bold' }}>{ed.degree}</Text>
                  ) : null}
                  {ed.school ? <Text style={s.sideText}>{ed.school}</Text> : null}
                  {(ed.start || ed.end) && (
                    <Text style={s.sideMuted}>
                      {[ed.start, ed.end].filter(Boolean).join(' — ')}
                    </Text>
                  )}
                  {ed.major ? <Text style={s.sideMuted}>{ed.major}</Text> : null}
                  {ed.gpa ? <Text style={s.sideMuted}>GPA: {ed.gpa}</Text> : null}
                </View>
              ))}
            </SideSection>
          ) : null}

          {certifications.length ? (
            <SideSection title={L.certifications} s={s}>
              {certifications.map((c, i) => (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={s.sideText}>{c.name}</Text>
                  {(c.issuer || c.date) && (
                    <Text style={s.sideMuted}>
                      {[c.issuer, c.date].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                </View>
              ))}
            </SideSection>
          ) : null}
        </View>

        <View style={s.main}>
          {summary ? (
            <View style={s.mainHeader}>
              <SectionHeading text={L.profile} color={COLORS.primary} rule />
              <Text style={s.paragraph}>{summary}</Text>
            </View>
          ) : null}

          {experience.length ? (
            <View>
              <SectionHeading text={L.experience} color={COLORS.primary} rule />
              {experience.map((e, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <View style={s.entryRow}>
                    <Text style={s.entryTitle}>{e.title || ''}</Text>
                    {(e.start || e.end) && (
                      <Text style={s.entryDates}>
                        {[e.start, e.end].filter(Boolean).join(' — ')}
                      </Text>
                    )}
                  </View>
                  {e.company ? <Text style={s.entryCompany}>{e.company}</Text> : null}
                  <MainBullets items={e.bullets} s={s} />
                </View>
              ))}
            </View>
          ) : null}

          {projects.length ? (
            <View>
              <SectionHeading text={L.projects} color={COLORS.primary} rule />
              {projects.map((p, i) => (
                <View key={i} style={s.entry} wrap={false}>
                  <Text style={s.entryTitle}>{p.name}</Text>
                  {p.description ? (
                    <Text style={s.entryDates}>{p.description}</Text>
                  ) : null}
                  <MainBullets items={p.bullets} s={s} />
                  {p.link ? <Text style={s.entryDates}>{p.link}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
