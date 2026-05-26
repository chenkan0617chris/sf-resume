'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResumeActionsProps {
  resumeId: string;
  isDefault: boolean;
}

const ghostBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 8,
  color: '#71717a',
  fontSize: 13,
  padding: '4px 10px',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
};

const dangerBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(239,68,68,0.4)',
  borderRadius: 8,
  color: '#f87171',
  fontSize: 13,
  padding: '4px 10px',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
};

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
    <div className="flex items-center gap-2">
      {!isDefault && (
        <button
          onClick={handleSetDefault}
          disabled={isWorking}
          style={{ ...ghostBase, opacity: isWorking ? 0.4 : 1 }}
        >
          Set as default
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isWorking}
        style={{ ...dangerBase, opacity: isWorking ? 0.4 : 1 }}
      >
        Delete
      </button>
    </div>
  );
}
