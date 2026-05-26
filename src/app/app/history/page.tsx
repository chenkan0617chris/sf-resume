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
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={badgeStyle}
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
    <main className="px-10 py-9">
      <h2
        className="mb-6 tracking-tight"
        style={{ fontSize: 22, fontWeight: 800, color: '#f4f4f5' }}
      >
        Application History
      </h2>

      {applications.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p className="text-sm" style={{ color: '#52525b' }}>
            No saved applications yet.
          </p>
          <Link
            href="/app/new"
            className="mt-4 inline-block text-sm font-medium"
            style={{ color: '#a855f7' }}
          >
            Start a new application
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
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

            const duration = formatDuration(app.durationMs);

            return (
              <li key={app.id}>
                <Link
                  href={`/app/history/${app.id}`}
                  className="group flex items-center gap-4 rounded-2xl p-5 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = 'rgba(124,58,237,0.04)';
                    el.style.borderColor = 'rgba(124,58,237,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = 'rgba(255,255,255,0.02)';
                    el.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <ScoreBadge score={score} />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-semibold"
                      style={{ fontSize: 13, color: '#d4d4d8' }}
                    >
                      {title}
                    </p>
                    <p
                      className="mt-0.5 truncate"
                      style={{ fontSize: 11, color: '#52525b' }}
                    >
                      {app.provider} &middot; {app.model}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <p style={{ fontSize: 11, color: '#3f3f46' }}>
                      {formatDate(app.createdAt)}
                    </p>
                    {duration && (
                      <p style={{ fontSize: 11, color: '#3f3f46' }}>
                        {duration}
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
