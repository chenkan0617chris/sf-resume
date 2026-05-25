// Fallback renderer: dumps the raw markdown into a monospaced block so the
// user always gets *something* downloadable even when parseResumeMarkdown
// returns null.

import { Document, Page, StyleSheet, Text } from '@react-pdf/renderer';
import { PAGE, pickFonts, type RenderLang } from './shared';

interface PlainTextTemplateProps {
  markdown: string;
  lang?: RenderLang;
}

function makeStyles(lang: RenderLang) {
  const fonts = pickFonts(lang);
  // CJK has no fixed-width built-in; fall back to NotoSansSC for zh.
  const fontFamily = lang === 'zh' ? fonts.sans : 'Courier';
  return StyleSheet.create({
    page: {
      fontFamily,
      fontSize: 9.5,
      lineHeight: 1.4,
      color: '#111',
      paddingTop: PAGE.padding,
      paddingBottom: PAGE.padding,
      paddingHorizontal: PAGE.padding,
    },
    body: {
      fontFamily,
      fontSize: 9.5,
      lineHeight: 1.4,
    },
  });
}

export default function PlainTextTemplate({
  markdown,
  lang = 'en',
}: PlainTextTemplateProps) {
  const text = typeof markdown === 'string' && markdown.length ? markdown : '';
  const s = makeStyles(lang);
  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <Text style={s.body}>{text}</Text>
      </Page>
    </Document>
  );
}
