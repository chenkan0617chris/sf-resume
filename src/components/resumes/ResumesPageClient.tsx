'use client';

import { useState } from 'react';
import NewResumeForm from './NewResumeForm';

export default function ResumesPageClient({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="font-extrabold tracking-tight"
          style={{ fontSize: 22, color: '#f4f4f5' }}
        >
          My Resumes
        </h2>
        {open ? (
          <button
            onClick={() => setOpen(false)}
            className="text-sm transition-colors"
            style={{ color: '#71717a' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = '#71717a')
            }
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              boxShadow: '0 0 16px rgba(124,58,237,0.3)',
            }}
          >
            + New Resume
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6"
            style={{
              background: 'rgba(18,18,24,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <NewResumeForm onCancel={() => setOpen(false)} />
          </div>
        </div>
      )}

      {children}
    </>
  );
}
