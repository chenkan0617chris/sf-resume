'use client';

interface DownloadButtonProps {
  markdown: string;
  filename: string;
}

export default function DownloadButton({ markdown, filename }: DownloadButtonProps) {
  function handleDownload() {
    const blob = new Blob([markdown], { type: 'text/markdown; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900"
    >
      Download .md
    </button>
  );
}
