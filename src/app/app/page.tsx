import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AppHome() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const recentApps = await prisma.application.findMany({
    where: { userId: session.user.id! },
    select: { id: true, company: true, role: true, analysisJson: true, durationMs: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const firstName = session.user.name?.split(' ')[0] || 'there';

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getScoreStyle(analysisJson: unknown): {
    bg: string;
    border: string;
    color: string;
    label: string;
  } {
    const score = (analysisJson as { score?: number } | null)?.score ?? null;
    if (score === null) {
      return {
        bg: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#52525b',
        label: '—',
      };
    }
    if (score >= 70) {
      return {
        bg: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(34,197,94,0.2)',
        color: '#4ade80',
        label: String(score),
      };
    }
    if (score >= 40) {
      return {
        bg: 'rgba(234,179,8,0.12)',
        border: '1px solid rgba(234,179,8,0.2)',
        color: '#fbbf24',
        label: String(score),
      };
    }
    return {
      bg: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#52525b',
      label: String(score),
    };
  }

  function getAppTitle(company: string | null, role: string | null): string {
    if (company && role) return `${company} — ${role}`;
    if (company) return company;
    if (role) return role;
    return 'Untitled';
  }

  return (
    <main className="px-10 py-9">
      <style>{`
        .app-item:hover {
          border-color: rgba(124,58,237,0.2) !important;
          background: rgba(124,58,237,0.04) !important;
        }
      `}</style>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#f4f4f5',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}
        >
          Welcome back, {firstName}
        </h2>
        <p style={{ fontSize: 13, color: '#52525b', marginTop: 4 }}>
          Ready for your next application?
        </p>
      </div>

      {/* Action cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          marginBottom: 32,
        }}
      >
        {/* Primary card — New Application */}
        <Link
          href="/app/new"
          style={{
            display: 'block',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.15))',
            border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: 16,
            padding: 26,
            position: 'relative',
            overflow: 'hidden',
            textDecoration: 'none',
          }}
        >
          {/* Radial glow */}
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 128,
              height: 128,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(124,58,237,0.35), transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          {/* Icon box */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(124,58,237,0.3)',
              border: '1px solid rgba(168,85,247,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              position: 'relative',
            }}
          >
            <svg
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#c084fc"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#f0e6ff',
              marginBottom: 6,
              position: 'relative',
            }}
          >
            New Application
          </div>
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.55,
              color: '#a78bfa',
              position: 'relative',
            }}
          >
            Tailor your resume to a job description and export a PDF.
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              fontSize: 16,
              color: '#7c3aed',
            }}
          >
            →
          </div>
        </Link>

        {/* Secondary card — My Resumes */}
        <Link
          href="/app/resumes"
          style={{
            display: 'block',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 26,
            position: 'relative',
            textDecoration: 'none',
          }}
        >
          {/* Icon box */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <svg
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
              stroke="#52525b"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#d4d4d8',
              marginBottom: 6,
            }}
          >
            My Resumes
          </div>
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.55,
              color: '#52525b',
            }}
          >
            Upload or edit your base resumes.
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              fontSize: 16,
              color: '#3f3f46',
            }}
          >
            →
          </div>
        </Link>
      </div>

      {/* Recent Applications section */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#3f3f46',
          marginBottom: 12,
        }}
      >
        Recent Applications
      </div>

      {recentApps.length === 0 ? (
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '18px 20px',
          }}
        >
          <Link
            href="/app/new"
            style={{
              fontSize: 13,
              color: '#52525b',
              textDecoration: 'none',
            }}
          >
            No applications yet. Start your first one →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recentApps.map((app) => {
            const score = getScoreStyle(app.analysisJson);
            const title = getAppTitle(app.company, app.role);
            const dateLabel = formatDate(app.createdAt);
            const durationLabel =
              app.durationMs != null
                ? `Generated in ${Math.round(app.durationMs / 1000)}s`
                : null;

            return (
              <Link
                key={app.id}
                href={`/app/history/${app.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                className="app-item"
              >
                {/* Score badge */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                    background: score.bg,
                    border: score.border,
                    color: score.color,
                  }}
                >
                  {score.label}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#d4d4d8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {title}
                  </div>
                  {durationLabel && (
                    <div style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>
                      {durationLabel}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div style={{ fontSize: 11, color: '#3f3f46', flexShrink: 0 }}>
                  {dateLabel}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
