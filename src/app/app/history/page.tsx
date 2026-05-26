import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(ms: number | null): string | null {
  if (!ms) return null;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-400">
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
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorClass}`}
    >
      {score}
    </span>
  );
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const userId = session.user.id;

  const applications = await prisma.application.findMany({
    where: { userId },
    select: {
      id: true,
      company: true,
      role: true,
      outputLang: true,
      provider: true,
      model: true,
      analysisJson: true,
      durationMs: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900">
        Application History
      </h2>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-zinc-500">No saved applications yet.</p>
          <Link
            href="/app/new"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
          >
            Start a new application
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {applications.map((app) => {
            const analysis = app.analysisJson as { score: number } | null;
            const score =
              analysis && typeof analysis.score === 'number'
                ? analysis.score
                : null;

            const title =
              app.company && app.role
                ? `${app.company} — ${app.role}`
                : app.company ?? app.role ?? 'Untitled';

            return (
              <li key={app.id}>
                <Link
                  href={`/app/history/${app.id}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <ScoreBadge score={score} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-zinc-900">
                      {title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">
                      {app.provider} &middot; {app.model}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <p className="text-xs text-zinc-400">{formatDate(app.createdAt)}</p>
                    {formatDuration(app.durationMs) && (
                      <p className="text-xs text-zinc-400">
                        Generated in {formatDuration(app.durationMs)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
