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
      <div className="flex h-[780px] items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
          <p className="text-xs text-zinc-500">Generating preview…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[780px] items-center justify-center rounded-lg border border-red-100 bg-red-50 px-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <iframe
      src={url!}
      className="h-[780px] w-full rounded-lg border border-zinc-100"
      title="Resume PDF Preview"
    />
  );
}
