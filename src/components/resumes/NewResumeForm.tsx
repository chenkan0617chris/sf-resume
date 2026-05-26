'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'upload' | 'paste';

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
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-zinc-900">New Resume</h3>

      {/* Mode toggle */}
      <div className="mb-4 flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={mode === 'upload'
            ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-zinc-900 shadow-sm'
            : 'px-3 py-1 text-sm text-zinc-500 hover:text-zinc-700'}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={mode === 'paste'
            ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-zinc-900 shadow-sm'
            : 'px-3 py-1 text-sm text-zinc-500 hover:text-zinc-700'}
        >
          Paste text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Label */}
        <div className="flex flex-col gap-1">
          <label htmlFor="resume-label" className="text-sm font-medium text-zinc-700">
            Label
          </label>
          <input
            id="resume-label"
            type="text"
            placeholder="e.g. Main Resume, Software Engineer 2026"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            disabled={isSubmitting}
          />
        </div>

        {mode === 'upload' ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-zinc-700">File <span className="text-zinc-400 font-normal">(PDF or DOCX)</span></p>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-8 text-center transition-colors hover:border-zinc-400 hover:bg-white"
              onClick={() => fileRef.current?.click()}
            >
              <svg className="mb-2 h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-zinc-600">
                {isParsing ? 'Parsing…' : 'Click to upload PDF or DOCX'}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {markdown ? `✓ Parsed (${markdown.length.toLocaleString()} chars)` : 'Your file is never stored — only the extracted text is saved'}
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
              <details className="rounded-lg border border-zinc-200 bg-zinc-50">
                <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900">
                  Preview extracted text
                </summary>
                <pre className="max-h-40 overflow-auto px-3 py-2 font-mono text-xs text-zinc-600 whitespace-pre-wrap">
                  {markdown.slice(0, 2000)}{markdown.length > 2000 ? '\n…' : ''}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="resume-markdown" className="text-sm font-medium text-zinc-700">
              Resume content <span className="text-zinc-400 font-normal">(Markdown or plain text)</span>
            </label>
            <textarea
              id="resume-markdown"
              placeholder="Paste your resume here…"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={12}
              className="rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              disabled={isSubmitting}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isParsing || !markdown.trim()}
            className="bg-zinc-900 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-zinc-700 transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Save Resume'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
