'use client';

import { useState } from 'react';

interface DownloadButtonsProps {
  markdown: string;
  filename: string;
  lang: 'en' | 'zh';
}

export default function DownloadButtons({ markdown, filename, lang }: DownloadButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function downloadBlob(url: string, body: object, outputFilename: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || data.error || `Request failed (${res.status})`);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = outputFilename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  async function handlePdf() {
    setError(null);
    setPdfLoading(true);
    try {
      await downloadBlob('/api/pdf', { markdown, template: 'kan', lang }, `${filename}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF generation failed');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleDocx() {
    setError(null);
    setDocxLoading(true);
    try {
      await downloadBlob('/api/docx', { markdown }, `${filename}.docx`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'DOCX generation failed');
    } finally {
      setDocxLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handlePdf}
          disabled={pdfLoading}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pdfLoading ? 'Generating…' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={handleDocx}
          disabled={docxLoading}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {docxLoading ? 'Generating…' : 'Download .docx'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
