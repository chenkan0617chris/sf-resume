'use client';

import { useEffect, useState } from 'react';

interface PdfPreviewProps {
  markdown: string;
  lang: 'en' | 'zh';
}

export default function PdfPreview({ markdown, lang }: PdfPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown, template: 'kan', lang }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(d.message || d.error || `Error ${res.status}`);
          });
        }
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? 'Failed to generate PDF preview');
        setLoading(false);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        className="flex h-[780px] items-center justify-center rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-7 w-7 animate-spin rounded-full"
            style={{
              border: '2px solid rgba(124,58,237,0.2)',
              borderTopColor: '#a855f7',
            }}
          />
          <p style={{ fontSize: 12, color: '#52525b' }}>Generating preview…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex h-[780px] items-center justify-center rounded-2xl overflow-hidden px-6 text-center"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}
      >
        <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <iframe
        src={url!}
        className="h-[780px] w-full"
        title="Resume PDF Preview"
      />
    </div>
  );
}
