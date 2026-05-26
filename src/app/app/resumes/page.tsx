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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <ResumesPageClient>
        {resumes.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <p className="text-zinc-500 text-sm">
              No resumes yet. Click &ldquo;+ New Resume&rdquo; to add one.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {resumes.map((resume) => (
              <li
                key={resume.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 truncate">
                        {resume.label}
                      </span>
                      {resume.isDefault && (
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
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
