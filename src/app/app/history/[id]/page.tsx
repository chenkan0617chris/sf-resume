import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { AnalysisJson } from '@/lib/providers/shared';
import DownloadButton from '@/components/history/DownloadButton';

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
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400">
        &mdash;
      </span>
    );
  }

  const colorClass =
    score >= 70
      ? 'bg-green-100 text-green-700'
      : score >= 40
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${colorClass}`}
    >
      {score}
    </span>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs text-zinc-500 capitalize">{label}</span>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-zinc-100">
          <div
            className="h-2 rounded-full bg-green-500"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-medium text-zinc-600">
        {value}
      </span>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  missing: 'bg-red-100 text-red-700',
  partial: 'bg-yellow-100 text-yellow-700',
  matched: 'bg-green-100 text-green-700',
};

const importanceStyles: Record<string, string> = {
  high: 'bg-zinc-800 text-white',
  medium: 'bg-zinc-200 text-zinc-700',
  low: 'bg-zinc-100 text-zinc-500',
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

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {/* Back link */}
      <Link
        href="/app/history"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
      >
        &larr; Back to History
      </Link>

      {/* Header card */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <ScoreBadge score={score} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
              <span>{application.provider}</span>
              <span>&middot;</span>
              <span>{application.model}</span>
              <span>&middot;</span>
              <span>{formatDate(application.createdAt)}</span>
              <span>&middot;</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 uppercase">
                {application.outputLang}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gap Analysis panel */}
      {analysis && (
        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Gap Analysis
          </h3>

          {/* Score breakdown */}
          <div className="mb-5 flex flex-col gap-2">
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
          <p className="mb-5 text-sm text-zinc-700">{analysis.summary}</p>

          {/* Gaps list */}
          {analysis.gaps.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Gaps
              </h4>
              <ul className="flex flex-col gap-2">
                {analysis.gaps.map((gap, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-zinc-800 text-sm">
                        {gap.item}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[gap.status] ?? ''}`}
                      >
                        {gap.status}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${importanceStyles[gap.importance] ?? ''}`}
                      >
                        {gap.importance}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {gap.category}
                      </span>
                    </div>
                    {gap.suggestion && (
                      <p className="text-xs text-zinc-500">{gap.suggestion}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div className="mb-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Strengths
              </h4>
              <ul className="flex flex-col gap-1 pl-4">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="list-disc text-sm text-zinc-700">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {analysis.improvements.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Improvements
              </h4>
              <ul className="flex flex-col gap-1 pl-4">
                {analysis.improvements.map((s, i) => (
                  <li key={i} className="list-disc text-sm text-zinc-700">
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
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Resume Output
            </h3>
            <DownloadButton
              markdown={outputMarkdown}
              filename={`${downloadFilename}.md`}
            />
          </div>
          <div className="max-h-[600px] overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <pre className="font-mono text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap break-words">
              {outputMarkdown}
            </pre>
          </div>
        </section>
      )}
    </main>
  );
}
