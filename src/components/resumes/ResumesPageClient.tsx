'use client';

import { useState } from 'react';
import NewResumeForm from './NewResumeForm';

export default function ResumesPageClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-zinc-900">My Resumes</h2>
        {open ? (
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="bg-zinc-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            + New Resume
          </button>
        )}
      </div>

      {open && (
        <div className="mb-6">
          <NewResumeForm onCancel={() => setOpen(false)} />
        </div>
      )}

      {children}
    </>
  );
}
