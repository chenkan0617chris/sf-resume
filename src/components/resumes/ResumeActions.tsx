'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResumeActionsProps {
  resumeId: string;
  isDefault: boolean;
}

export default function ResumeActions({ resumeId, isDefault }: ResumeActionsProps) {
  const router = useRouter();
  const [isWorking, setIsWorking] = useState(false);

  async function handleSetDefault() {
    setIsWorking(true);
    try {
      await fetch(`/api/resume/${resumeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      router.refresh();
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    setIsWorking(true);
    try {
      await fetch(`/api/resume/${resumeId}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {!isDefault && (
        <button
          onClick={handleSetDefault}
          disabled={isWorking}
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-40"
        >
          Set as default
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isWorking}
        className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
      >
        Delete
      </button>
    </div>
  );
}
