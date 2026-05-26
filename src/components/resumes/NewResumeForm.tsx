'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'upload' | 'paste';

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 10,
  color: '#d4d4d8',
  width: '100%',
  padding: '8px 12px',
  fontSize: 14,
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  color: '#71717a',
  fontSize: 13,
  fontWeight: 500,
};

export default function NewResumeForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>('upload');
  const [label, setLabel] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.replace(/\.[^.]+$/, '');
    if (!label) setLabel(name);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx');

    if (!isPdf && !isDocx) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('file', file);
      const endpoint = isPdf ? '/api/resume/parse-pdf' : '/api/resume/parse-docx';
      const res = await fetch(endpoint, { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message || 'Parse failed');
      setMarkdown((data as { markdown: string }).markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file.');
    } finally {
      setIsParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!markdown.trim()) {
      setError('Resume content is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim() || 'Untitled Resume',
          source: 'form',
          markdown: markdown.trim(),
          isDefault: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to save resume.');
      }

      router.refresh();
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h3
        className="mb-5 font-semibold"
        style={{ color: '#f4f4f5', fontSize: 16 }}
      >
        New Resume
      </h3>

      {/* Mode toggle */}
      <div
        className="mb-5 flex items-center gap-1 w-fit rounded-xl p-1"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          type="button"
          onClick={() => setMode('upload')}
          className="rounded-lg px-3 py-1 text-sm font-medium transition-all"
          style={
            mode === 'upload'
              ? {
                  background: 'rgba(124,58,237,0.2)',
                  color: '#c084fc',
                }
              : { color: '#71717a' }
          }
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setMode('paste')}
          className="rounded-lg px-3 py-1 text-sm font-medium transition-all"
          style={
            mode === 'paste'
              ? {
                  background: 'rgba(124,58,237,0.2)',
                  color: '#c084fc',
                }
              : { color: '#71717a' }
          }
        >
          Paste text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Label */}
        <div className="flex flex-col gap-1">
          <label htmlFor="resume-label" style={labelStyle}>
            Label
          </label>
          <input
            id="resume-label"
            type="text"
            placeholder="e.g. Main Resume, Software Engineer 2026"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{
              ...inputStyle,
              // placeholder color handled via global or inline workaround is not possible; keep default
            }}
            disabled={isSubmitting}
          />
        </div>

        {mode === 'upload' ? (
          <div className="flex flex-col gap-2">
            <p style={labelStyle}>
              File{' '}
              <span style={{ color: '#52525b', fontWeight: 400 }}>
                (PDF or DOCX)
              </span>
            </p>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl px-6 py-8 text-center transition-all duration-200"
              style={{
                border: '2px dashed rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
              }}
              onClick={() => fileRef.current?.click()}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.border =
                  '2px dashed rgba(124,58,237,0.4)';
                (e.currentTarget as HTMLDivElement).style.background =
                  'rgba(124,58,237,0.04)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.border =
                  '2px dashed rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLDivElement).style.background =
                  'rgba(255,255,255,0.02)';
              }}
            >
              <svg
                className="mb-2 h-8 w-8"
                style={{ color: '#52525b' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-sm" style={{ color: '#a1a1aa' }}>
                {isParsing ? 'Parsing...' : 'Click to upload PDF or DOCX'}
              </p>
              <p className="mt-1 text-xs" style={{ color: '#52525b' }}>
                {markdown
                  ? `Parsed (${markdown.length.toLocaleString()} chars)`
                  : 'Your file is never stored — only the extracted text is saved'}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileChange}
                disabled={isParsing || isSubmitting}
              />
            </div>
            {markdown && (
              <details
                className="rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <summary
                  className="cursor-pointer px-3 py-2 text-xs font-medium"
                  style={{ color: '#71717a' }}
                >
                  Preview extracted text
                </summary>
                <pre
                  className="max-h-40 overflow-auto px-3 py-2 font-mono text-xs whitespace-pre-wrap"
                  style={{ color: '#71717a' }}
                >
                  {markdown.slice(0, 2000)}
                  {markdown.length > 2000 ? '\n...' : ''}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="resume-markdown" style={labelStyle}>
              Resume content{' '}
              <span style={{ color: '#52525b', fontWeight: 400 }}>
                (Markdown or plain text)
              </span>
            </label>
            <textarea
              id="resume-markdown"
              placeholder="Paste your resume here..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={12}
              style={{ ...inputStyle, fontFamily: 'monospace', resize: 'vertical' }}
              disabled={isSubmitting}
            />
          </div>
        )}

        {error && (
          <p className="text-sm" style={{ color: '#f87171' }}>
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isParsing || !markdown.trim()}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              boxShadow: '0 0 16px rgba(124,58,237,0.3)',
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save Resume'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-sm transition-colors disabled:opacity-40"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8,
              color: '#71717a',
              padding: '6px 12px',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
