import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ResumesPageClient from '@/components/resumes/ResumesPageClient';
import ResumeActions from '@/components/resumes/ResumeActions';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ResumesPage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      label: true,
      isDefault: true,
      source: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <main className="px-10 py-9">
      <ResumesPageClient>
        {resumes.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-sm" style={{ color: '#52525b' }}>
              No resumes yet. Click &ldquo;+ New Resume&rdquo; to add one.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {resumes.map((resume) => (
              <li
                key={resume.id}
                className="rounded-2xl p-5 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLIElement).style.border =
                    '1px solid rgba(124,58,237,0.2)';
                  (e.currentTarget as HTMLLIElement).style.background =
                    'rgba(124,58,237,0.04)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLIElement).style.border =
                    '1px solid rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLLIElement).style.background =
                    'rgba(255,255,255,0.02)';
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-semibold truncate"
                        style={{ color: '#d4d4d8' }}
                      >
                        {resume.label}
                      </span>
                      {resume.isDefault && (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 font-medium"
                          style={{
                            background: 'rgba(124,58,237,0.15)',
                            border: '1px solid rgba(124,58,237,0.25)',
                            color: '#c084fc',
                            fontSize: 10,
                          }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: '#52525b' }}>
                      Created {formatDate(resume.createdAt)} &middot; Updated{' '}
                      {formatDate(resume.updatedAt)}
                    </p>
                  </div>
                  <ResumeActions
                    resumeId={resume.id}
                    isDefault={resume.isDefault}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </ResumesPageClient>
    </main>
  );
}
