import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { AnalysisJson } from '@/lib/providers/shared';
import DownloadButton from '@/components/history/DownloadButton';
import PdfPreview from '@/components/history/PdfPreview';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#52525b',
        }}
      >
        &mdash;
      </span>
    );
  }

  const badgeStyle =
    score >= 70
      ? {
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.2)',
          color: '#4ade80',
        }
      : score >= 40
        ? {
            background: 'rgba(234,179,8,0.12)',
            border: '1px solid rgba(234,179,8,0.2)',
            color: '#fbbf24',
          }
        : {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#52525b',
          };

  return (
    <span
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
      style={badgeStyle}
    >
      {score}
    </span>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-24 shrink-0 capitalize"
        style={{ fontSize: 11, color: '#71717a' }}
      >
        {label}
      </span>
      <div className="flex-1">
        <div
          className="h-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${value}%`,
              background: 'linear-gradient(90deg,#7c3aed,#a855f7)',
            }}
          />
        </div>
      </div>
      <span
        className="w-8 shrink-0 text-right font-medium"
        style={{ fontSize: 11, color: '#a1a1aa' }}
      >
        {value}
      </span>
    </div>
  );
}

const statusStyles: Record<string, React.CSSProperties> = {
  missing: { background: 'rgba(239,68,68,0.15)', color: '#f87171' },
  partial: { background: 'rgba(234,179,8,0.15)', color: '#fbbf24' },
  matched: { background: 'rgba(34,197,94,0.12)', color: '#4ade80' },
};

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const { id } = await params;

  const application = await prisma.application.findUnique({ where: { id } });

  if (!application || application.userId !== session.user.id) {
    redirect('/app/history');
  }

  const analysis = application.analysisJson as AnalysisJson | null;
  const score = analysis?.score ?? null;

  const title =
    application.company && application.role
      ? `${application.company} — ${application.role}`
      : application.company ?? application.role ?? 'Untitled Application';

  const outputMarkdown =
    (application.resultEditedMarkdown ?? application.resultMarkdown) ?? '';

  const downloadFilename =
    [application.company, application.role]
      .filter(Boolean)
      .join('-')
      .replace(/\s+/g, '_')
      .toLowerCase() || 'resume';

  const panelStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#3f3f46',
  };

  return (
    <main className="px-10 py-9">
      {/* Back link */}
      <Link
        href="/app/history"
        className="mb-7 inline-flex items-center gap-1 text-sm transition-colors text-[#71717a] hover:text-[#a1a1aa]"
      >
        &larr; History
      </Link>

      {/* Header card */}
      <div className="mb-7 rounded-2xl p-6" style={panelStyle}>
        <div className="flex items-start gap-5">
          <ScoreBadge score={score} />
          <div className="min-w-0 flex-1">
            <h2
              className="font-extrabold tracking-tight"
              style={{ fontSize: 24, color: '#f4f4f5' }}
            >
              {title}
            </h2>
            <div
              className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1"
              style={{ fontSize: 12, color: '#52525b' }}
            >
              <span>{formatDate(application.createdAt)}</span>
              <span>&middot;</span>
              <span>{application.provider}</span>
              <span>&middot;</span>
              <span>{application.model}</span>
              {application.outputLang && (
                <>
                  <span>&middot;</span>
                  <span
                    className="rounded-full px-2 py-0.5 font-medium uppercase"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#71717a',
                      fontSize: 10,
                    }}
                  >
                    {application.outputLang}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: Gap Analysis + Resume Output */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Gap Analysis panel */}
        {analysis && (
          <section className="rounded-2xl p-6" style={panelStyle}>
            <h3 className="mb-5" style={sectionLabelStyle}>
              Gap Analysis
            </h3>

            {/* Score breakdown */}
            <div className="mb-6 flex flex-col gap-3">
              {(
                ['skills', 'experience', 'keywords', 'education'] as const
              ).map((key) => (
                <ProgressBar
                  key={key}
                  label={key}
                  value={analysis.scoreBreakdown[key]}
                />
              ))}
            </div>

            {/* Summary */}
            <p className="mb-6 text-sm" style={{ color: '#a1a1aa' }}>
              {analysis.summary}
            </p>

            {/* Gaps list */}
            {analysis.gaps.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3" style={sectionLabelStyle}>
                  Gaps
                </h4>
                <ul className="flex flex-col gap-2">
                  {analysis.gaps.map((gap, i) => (
                    <li
                      key={i}
                      className="rounded-xl p-3"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className="font-medium text-sm"
                          style={{ color: '#d4d4d8' }}
                        >
                          {gap.item}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={statusStyles[gap.status] ?? {}}
                        >
                          {gap.status}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background:
                              gap.importance === 'high'
                                ? 'rgba(124,58,237,0.15)'
                                : gap.importance === 'medium'
                                  ? 'rgba(255,255,255,0.06)'
                                  : 'rgba(255,255,255,0.03)',
                            color:
                              gap.importance === 'high'
                                ? '#a855f7'
                                : gap.importance === 'medium'
                                  ? '#71717a'
                                  : '#52525b',
                          }}
                        >
                          {gap.importance}
                        </span>
                        <span style={{ fontSize: 11, color: '#52525b' }}>
                          {gap.category}
                        </span>
                      </div>
                      {gap.suggestion && (
                        <p className="text-xs" style={{ color: '#71717a' }}>
                          {gap.suggestion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3" style={sectionLabelStyle}>
                  Strengths
                </h4>
                <ul className="flex flex-col gap-1.5 pl-4">
                  {analysis.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="list-disc text-sm"
                      style={{ color: '#a1a1aa' }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements.length > 0 && (
              <div>
                <h4 className="mb-3" style={sectionLabelStyle}>
                  Improvements
                </h4>
                <ul className="flex flex-col gap-1.5 pl-4">
                  {analysis.improvements.map((s, i) => (
                    <li
                      key={i}
                      className="list-disc text-sm"
                      style={{ color: '#a1a1aa' }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Resume Output panel */}
        {outputMarkdown && (
          <section className="rounded-2xl p-6" style={panelStyle}>
            <div className="mb-5 flex items-center justify-between">
              <h3 style={sectionLabelStyle}>Resume Output</h3>
              <DownloadButton
                markdown={outputMarkdown}
                filename={downloadFilename}
                lang={application.outputLang as 'en' | 'zh'}
              />
            </div>
            <PdfPreview
              markdown={outputMarkdown}
              lang={application.outputLang as 'en' | 'zh'}
            />
          </section>
        )}
      </div>
    </main>
  );
}
