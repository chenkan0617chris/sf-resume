// Builds the user-message prompt for the streaming resume rewrite.
// Output contract: pure Markdown following the heading conventions used by
// our PDF templates' parseResumeMarkdown.

import type { OutputLang } from '../providers/shared';

const SYSTEM_INSTRUCTIONS = `You are a professional resume writer who specializes in tailoring resumes to specific job descriptions for ATS-optimized, recruiter-friendly results.

Your rules — non-negotiable:
1. NEVER fabricate experience, skills, employers, titles, dates, education, or accomplishments. Only rephrase, reorder, and emphasize what already exists in the original resume.
2. Embed exact keywords and phrases from the job description wherever they truthfully apply to the candidate's background. ATS systems match literal strings.
3. Rewrite each experience bullet in the STAR pattern (Situation, Task, Action, Result) and quantify outcomes whenever the source material allows (numbers, percentages, scale).
4. Rewrite the Summary section to be 2-4 sentences that directly address the target role's core requirements.
5. Reorder the Skills section so JD-relevant skills appear FIRST within each group (technical, soft). Do not invent new skills.
6. Preserve the candidate's voice and tense conventions (past tense for previous roles, present tense for current role).
7. Keep the resume length comparable to the original — do not pad.
8. Projects section: include at most 5 projects, ordered by JD relevance first, then recency. Drop projects that have little overlap with the JD.`;

function formatRulesEn(): string {
  return `Output formatting — follow EXACTLY:

- Use Markdown only.
- "# Full Name" as the first line (H1).
- Immediately under the H1, contact info on one or two lines (email · phone · location · linkedin). Use the middle dot · as the separator.
- Major sections use "## Section Name": Summary, Experience, Education, Skills, Projects, Certifications (include only sections the resume has content for).
- Inside Experience, each role starts with: "**Job Title** · Company · Start Date – End Date" on its own line, followed by bulleted achievements ("- ").
- Inside Education, each entry starts with: "**Degree, Major** · School · Start Date – End Date" on its own line. Include GPA / honors as a sub-bullet only if present in source.
- Skills are grouped: under "## Skills", use "**Technical:** ..." and "**Soft:** ..." comma-separated lines (or sub-headings if the original used them).
- Inside Projects, each entry starts with "**Project Name** · Date Range" on its own line. Use bulleted achievements ("- "), one per accomplishment. Do not include "Tech Stack:" lines.
- Bullets are dash-prefixed ("- "), never asterisks. One blank line between sections.`;
}

function formatRulesZh(): string {
  return `输出格式 —— 严格遵守：

- 仅使用 Markdown。
- 第一行用 "# 全名"（H1）。
- H1 紧下方写联系方式（邮箱 · 电话 · 地点 · LinkedIn），用中点 · 分隔，一到两行。
- 主要章节用 "## 章节名"，章节名使用以下中文：摘要 / 工作经历 / 教育背景 / 技能 / 项目经验 / 证书（只输出原简历有内容的章节）。
- 工作经历每段以 "**职位** · 公司 · 起始日期 – 结束日期" 开头单独一行，下方用 "- " 列出成就 bullet。
- 教育背景每段以 "**学位，专业** · 学校 · 起始日期 – 结束日期" 开头单独一行；GPA / 荣誉若原文有则作为子 bullet。
- 技能章节用 "**技术：** ..." 和 "**软技能：** ..." 两行，逗号分隔。
- 项目经验每段以 "**项目名** · 日期范围" 开头单独一行，bullet 列出成就（"- "）。不要写 "技术栈:" 这种行。
- bullet 一律用 "- "，禁止用星号。章节之间空一行。`;
}

function languageDirective(lang: OutputLang): string {
  if (lang === 'zh') {
    return `语言要求：用**简体中文**重写整份简历的所有内容（摘要、bullet、技能列表等）。不要混用英文段落。技术名词（如 React, Python, Azure）保留英文原文，其他内容使用中文。`;
  }
  return `LANGUAGE: Write the entire rewritten resume in English. Keep the candidate's original spelling/punctuation conventions.`;
}

const CLOSING_EN = `Output the rewritten resume in Markdown only. No explanation, no commentary, no code fences.`;
const CLOSING_ZH = `只输出 Markdown 格式的重写简历。不要任何说明、评论或代码围栏。`;

/**
 * Build the rewrite prompt body.
 */
export function buildRewritePrompt(
  resumeMarkdown: string,
  jdText: string,
  outputLang: OutputLang
): string {
  const safeResume = (resumeMarkdown ?? '').toString().trim();
  const safeJd = (jdText ?? '').toString().trim();
  const formatRules = outputLang === 'zh' ? formatRulesZh() : formatRulesEn();
  const closing = outputLang === 'zh' ? CLOSING_ZH : CLOSING_EN;

  return [
    SYSTEM_INSTRUCTIONS,
    '',
    '--- ORIGINAL RESUME ---',
    safeResume,
    '',
    '--- TARGET JOB DESCRIPTION ---',
    safeJd,
    '',
    '--- TASK ---',
    "Rewrite the candidate's resume so it is tightly aligned to the target job description. Stay strictly within the truthful boundaries of the original. Maximize ATS keyword match and recruiter readability.",
    '',
    formatRules,
    '',
    languageDirective(outputLang),
    '',
    closing,
  ].join('\n');
}
