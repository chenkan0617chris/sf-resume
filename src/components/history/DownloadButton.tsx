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

  const ghostButtonStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8,
    color: '#a1a1aa',
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.15s, color 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handlePdf}
          disabled={pdfLoading}
          style={{
            ...ghostButtonStyle,
            opacity: pdfLoading ? 0.5 : 1,
            cursor: pdfLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {pdfLoading ? (
            <>
              <span
                className="inline-block h-3 w-3 animate-spin rounded-full"
                style={{
                  border: '2px solid rgba(124,58,237,0.3)',
                  borderTopColor: '#a855f7',
                }}
              />
              Generating…
            </>
          ) : (
            'Download PDF'
          )}
        </button>
        <button
          type="button"
          onClick={handleDocx}
          disabled={docxLoading}
          style={{
            ...ghostButtonStyle,
            opacity: docxLoading ? 0.5 : 1,
            cursor: docxLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {docxLoading ? (
            <>
              <span
                className="inline-block h-3 w-3 animate-spin rounded-full"
                style={{
                  border: '2px solid rgba(124,58,237,0.3)',
                  borderTopColor: '#a855f7',
                }}
              />
              Generating…
            </>
          ) : (
            'Download .docx'
          )}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 11, color: '#f87171' }}>{error}</p>
      )}
    </div>
  );
}
