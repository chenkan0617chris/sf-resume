'use client';

import { useEffect, useReducer, useRef } from 'react';
import type { AnalysisJson, GapStatus, Importance } from '@/lib/providers/shared';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Resume {
  id: string;
  label: string;
  source: string;
  markdown: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WizardState {
  step: 1 | 2 | 3 | 4;

  // Step 1
  resumes: Resume[];
  resumesLoading: boolean;
  resumesError: string | null;
  selectedResumeId: string | null;
  pastedMarkdown: string;
  usePasted: boolean;

  // Step 2
  jdText: string;
  company: string;
  role: string;
  analyzing: boolean;
  analyzeError: string | null;

  // Step 3
  analysis: AnalysisJson | null;
  rewriting: boolean;
  rewriteError: string | null;
  resultMarkdown: string;
  resultEditedMarkdown: string;
  rewriteDone: boolean;

  // Step 4
  saving: boolean;
  saveError: string | null;
  savedApplicationId: string | null;
  pdfLoading: boolean;
  pdfError: string | null;

  // Global
  outputLang: 'en' | 'zh';

  // Processing UX
  processingView: boolean;
  processingPhase: 'rewriting' | 'saving' | null;
  processingError: string | null;
  snackbar: { appId: string; durationMs: number } | null;
}

type WizardAction =
  | { type: 'SET_RESUMES_LOADING' }
  | { type: 'SET_RESUMES'; resumes: Resume[] }
  | { type: 'SET_RESUMES_ERROR'; error: string }
  | { type: 'SELECT_RESUME'; id: string }
  | { type: 'SET_PASTED_MARKDOWN'; text: string }
  | { type: 'SET_USE_PASTED'; value: boolean }
  | { type: 'SET_JD_TEXT'; text: string }
  | { type: 'SET_COMPANY'; text: string }
  | { type: 'SET_ROLE'; text: string }
  | { type: 'SET_ANALYZING'; value: boolean }
  | { type: 'SET_ANALYZE_ERROR'; error: string | null }
  | { type: 'SET_ANALYSIS'; analysis: AnalysisJson }
  | { type: 'SET_REWRITING'; value: boolean }
  | { type: 'SET_REWRITE_ERROR'; error: string | null }
  | { type: 'SET_RESULT_MARKDOWN'; text: string }
  | { type: 'SET_RESULT_EDITED_MARKDOWN'; text: string }
  | { type: 'SET_REWRITE_DONE'; value: boolean }
  | { type: 'SET_SAVING'; value: boolean }
  | { type: 'SET_SAVE_ERROR'; error: string | null }
  | { type: 'SET_SAVED'; applicationId: string }
  | { type: 'SET_PDF_LOADING'; value: boolean }
  | { type: 'SET_PDF_ERROR'; error: string | null }
  | { type: 'SET_OUTPUT_LANG'; lang: 'en' | 'zh' }
  | { type: 'GO_TO_STEP'; step: 1 | 2 | 3 | 4 }
  | { type: 'START_PROCESSING' }
  | { type: 'SET_PROCESSING_PHASE'; phase: 'rewriting' | 'saving' | null }
  | { type: 'SET_PROCESSING_ERROR'; error: string }
  | { type: 'CANCEL_PROCESSING' }
  | { type: 'SHOW_SNACKBAR'; appId: string; durationMs: number }
  | { type: 'DISMISS_SNACKBAR' };

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_RESUMES_LOADING':
      return { ...state, resumesLoading: true, resumesError: null };
    case 'SET_RESUMES':
      return { ...state, resumesLoading: false, resumes: action.resumes };
    case 'SET_RESUMES_ERROR':
      return { ...state, resumesLoading: false, resumesError: action.error };
    case 'SELECT_RESUME':
      return { ...state, selectedResumeId: action.id, usePasted: false };
    case 'SET_PASTED_MARKDOWN':
      return { ...state, pastedMarkdown: action.text };
    case 'SET_USE_PASTED':
      return {
        ...state,
        usePasted: action.value,
        selectedResumeId: action.value ? null : state.selectedResumeId,
      };
    case 'SET_JD_TEXT':
      return { ...state, jdText: action.text };
    case 'SET_COMPANY':
      return { ...state, company: action.text };
    case 'SET_ROLE':
      return { ...state, role: action.text };
    case 'SET_ANALYZING':
      return { ...state, analyzing: action.value, analyzeError: null };
    case 'SET_ANALYZE_ERROR':
      return { ...state, analyzing: false, analyzeError: action.error };
    case 'SET_ANALYSIS':
      return { ...state, analyzing: false, analysis: action.analysis, step: 3 };
    case 'SET_REWRITING':
      return { ...state, rewriting: action.value, rewriteError: null };
    case 'SET_REWRITE_ERROR':
      return { ...state, rewriting: false, rewriteError: action.error };
    case 'SET_RESULT_MARKDOWN':
      return { ...state, resultMarkdown: action.text };
    case 'SET_RESULT_EDITED_MARKDOWN':
      return { ...state, resultEditedMarkdown: action.text };
    case 'SET_REWRITE_DONE':
      return { ...state, rewriting: false, rewriteDone: action.value };
    case 'SET_SAVING':
      return { ...state, saving: action.value, saveError: null };
    case 'SET_SAVE_ERROR':
      return { ...state, saving: false, saveError: action.error };
    case 'SET_SAVED':
      return { ...state, saving: false, savedApplicationId: action.applicationId };
    case 'SET_PDF_LOADING':
      return { ...state, pdfLoading: action.value, pdfError: null };
    case 'SET_PDF_ERROR':
      return { ...state, pdfLoading: false, pdfError: action.error };
    case 'SET_OUTPUT_LANG':
      return { ...state, outputLang: action.lang };
    case 'GO_TO_STEP':
      return { ...state, step: action.step };
    case 'START_PROCESSING':
      return { ...state, processingView: true, processingPhase: 'rewriting', processingError: null };
    case 'SET_PROCESSING_PHASE':
      return { ...state, processingPhase: action.phase };
    case 'SET_PROCESSING_ERROR':
      return { ...state, processingPhase: null, processingError: action.error };
    case 'CANCEL_PROCESSING':
      return { ...state, processingView: false, processingPhase: null, processingError: null };
    case 'SHOW_SNACKBAR':
      return { ...state, processingView: false, processingPhase: null, snackbar: { appId: action.appId, durationMs: action.durationMs }, step: 4, savedApplicationId: action.appId };
    case 'DISMISS_SNACKBAR':
      return { ...state, snackbar: null };
    default:
      return state;
  }
}

const initialState: WizardState = {
  step: 1,
  resumes: [],
  resumesLoading: false,
  resumesError: null,
  selectedResumeId: null,
  pastedMarkdown: '',
  usePasted: false,
  jdText: '',
  company: '',
  role: '',
  analyzing: false,
  analyzeError: null,
  analysis: null,
  rewriting: false,
  rewriteError: null,
  resultMarkdown: '',
  resultEditedMarkdown: '',
  rewriteDone: false,
  saving: false,
  saveError: null,
  savedApplicationId: null,
  pdfLoading: false,
  pdfError: null,
  outputLang: 'en',
  processingView: false,
  processingPhase: null,
  processingError: null,
  snackbar: null,
};

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = ['Select Resume', 'Job Description', 'Review & Rewrite', 'Export PDF'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isFuture = stepNum > currentStep;

        return (
          <div key={stepNum} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isDone
                    ? 'bg-zinc-900 text-white'
                    : isCurrent
                    ? 'bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200',
                ].join(' ')}
              >
                {isDone ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={[
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-zinc-900' : isFuture ? 'text-zinc-400' : 'text-zinc-600',
                ].join(' ')}
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={[
                  'mx-3 mb-5 h-px w-16 flex-shrink-0',
                  isDone ? 'bg-zinc-900' : 'bg-zinc-200',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 — Select Resume ───────────────────────────────────────────────────

function Step1({
  state,
  dispatch,
  onNext,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  onNext: () => void;
}) {
  const { resumes, resumesLoading, resumesError, selectedResumeId, pastedMarkdown, usePasted } =
    state;

  const activeMarkdown = usePasted
    ? pastedMarkdown
    : resumes.find((r) => r.id === selectedResumeId)?.markdown ?? '';

  const canProceed = usePasted ? pastedMarkdown.trim().length > 0 : selectedResumeId !== null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Select a resume</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Choose a saved resume or paste your resume as markdown text.
        </p>
      </div>

      {resumesLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Spinner size="sm" />
          Loading your resumes...
        </div>
      )}

      {resumesError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {resumesError}
        </div>
      )}

      {!resumesLoading && resumes.length === 0 && !resumesError && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          No saved resumes found. Use the paste option below.
        </div>
      )}

      {!resumesLoading && resumes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {resumes.map((resume) => {
            const isSelected = !usePasted && selectedResumeId === resume.id;
            return (
              <button
                key={resume.id}
                type="button"
                onClick={() => dispatch({ type: 'SELECT_RESUME', id: resume.id })}
                className={[
                  'flex flex-col gap-1 rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                    : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 hover:shadow-sm',
                ].join(' ')}
              >
                <span className="font-medium">{resume.label}</span>
                <span
                  className={[
                    'text-xs',
                    isSelected ? 'text-zinc-300' : 'text-zinc-400',
                  ].join(' ')}
                >
                  {resume.source === 'pdf' ? 'PDF import' : 'Form'} &middot;{' '}
                  {new Date(resume.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {resume.isDefault && (
                  <span
                    className={[
                      'mt-1 w-fit rounded px-1.5 py-0.5 text-xs font-medium',
                      isSelected
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-100 text-zinc-600',
                    ].join(' ')}
                  >
                    Default
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Paste fallback */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={usePasted}
            onChange={(e) => dispatch({ type: 'SET_USE_PASTED', value: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900"
          />
          <span className="text-sm font-medium text-zinc-800">Paste resume as text instead</span>
        </label>

        {usePasted && (
          <textarea
            className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-0 resize-y"
            rows={12}
            placeholder={`# Jane Smith\n\n## Experience\n\n### Software Engineer — Acme Corp\n*Jan 2022 – Present*\n\n- Built features...`}
            value={pastedMarkdown}
            onChange={(e) => dispatch({ type: 'SET_PASTED_MARKDOWN', text: e.target.value })}
          />
        )}
      </div>

      {/* Preview */}
      {activeMarkdown && (
        <details className="rounded-xl border border-zinc-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-700 hover:text-zinc-900">
            Preview selected resume ({activeMarkdown.length.toLocaleString()} chars)
          </summary>
          <pre className="max-h-48 overflow-auto border-t border-zinc-100 px-4 py-3 font-mono text-xs text-zinc-600 whitespace-pre-wrap">
            {activeMarkdown}
          </pre>
        </details>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
        >
          Next: Job Description
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 — Job Description ─────────────────────────────────────────────────

function Step2({
  state,
  dispatch,
  getResumeMarkdown,
  onBack,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  getResumeMarkdown: () => string;
  onBack: () => void;
}) {
  const { jdText, company, role, analyzing, analyzeError } = state;
  const canAnalyze = jdText.trim().length >= 50 && !analyzing;

  async function handleAnalyze() {
    dispatch({ type: 'SET_ANALYZING', value: true });

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeMarkdown: getResumeMarkdown(),
          jdText: jdText.trim(),
          outputLang: state.outputLang,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.error === 'QUOTA_EXCEEDED'
            ? 'You have reached your daily analysis limit.'
            : data.message || `Error ${res.status}: ${data.error || res.statusText}`;
        dispatch({ type: 'SET_ANALYZE_ERROR', error: msg });
        return;
      }

      const data = await res.json();
      dispatch({ type: 'SET_ANALYSIS', analysis: data as AnalysisJson });
    } catch (err) {
      dispatch({
        type: 'SET_ANALYZE_ERROR',
        error: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Job Description</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Paste the full job description. The more detail, the better the analysis.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_OUTPUT_LANG', lang: 'en' })}
          className={state.outputLang === 'en' ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-zinc-900 shadow-sm' : 'px-3 py-1 text-sm text-zinc-500 hover:text-zinc-700'}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_OUTPUT_LANG', lang: 'zh' })}
          className={state.outputLang === 'zh' ? 'rounded-md bg-white px-3 py-1 text-sm font-medium text-zinc-900 shadow-sm' : 'px-3 py-1 text-sm text-zinc-500 hover:text-zinc-700'}
        >
          中文
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Company name <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => dispatch({ type: 'SET_COMPANY', text: e.target.value })}
            placeholder="Acme Corp"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            Role / title <span className="text-zinc-400">(optional)</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => dispatch({ type: 'SET_ROLE', text: e.target.value })}
            placeholder="Senior Software Engineer"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          Job description <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none resize-y"
          rows={14}
          placeholder="Paste the full job description here (at least 50 characters)..."
          value={jdText}
          onChange={(e) => dispatch({ type: 'SET_JD_TEXT', text: e.target.value })}
        />
        <p className="mt-1 text-xs text-zinc-400">
          {jdText.length} characters
          {jdText.trim().length < 50 && jdText.length > 0 && (
            <span className="ml-1 text-amber-600">— need at least 50 to analyze</span>
          )}
        </p>
      </div>

      {analyzeError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {analyzeError}
        </div>
      )}

      {analyzing && (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-600">
          <Spinner size="md" />
          <span>Analyzing your resume fit...</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={analyzing}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={handleAnalyze}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
        >
          Analyze
        </button>
      </div>
    </div>
  );
}

// ─── Gap Analysis sub-panel ───────────────────────────────────────────────────

const statusConfig: Record<GapStatus, { label: string; className: string }> = {
  missing: { label: 'Missing', className: 'bg-red-100 text-red-700' },
  partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-700' },
  matched: { label: 'Matched', className: 'bg-green-100 text-green-700' },
};

function importanceClass(imp: Importance): string {
  if (imp === 'high') return 'font-bold text-zinc-900';
  if (imp === 'medium') return 'font-normal text-zinc-800';
  return 'font-normal text-zinc-400';
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-zinc-700 capitalize">{label}</span>
        <span className="text-zinc-500">{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-100">
        <div
          className={[
            'h-2 rounded-full transition-all',
            value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-400' : 'bg-red-400',
          ].join(' ')}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function GapAnalysisPanel({ analysis }: { analysis: AnalysisJson }) {
  const { score, scoreBreakdown, summary, gaps, strengths, improvements } = analysis;

  const scoreColor =
    score >= 70 ? 'text-green-700 bg-green-50 border-green-200' :
    score >= 40 ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
    'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="space-y-5">
      {/* Score badge */}
      <div className="flex items-center gap-4">
        <div
          className={[
            'flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 text-xl font-bold',
            scoreColor,
          ].join(' ')}
        >
          {score}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Overall Score</p>
          <p className="text-2xl font-bold text-zinc-900">{score}<span className="text-sm font-normal text-zinc-400">/100</span></p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Breakdown</p>
        {(Object.entries(scoreBreakdown) as [string, number][]).map(([key, val]) => (
          <ScoreBar key={key} label={key} value={val} />
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">Summary</p>
        <p className="text-sm text-zinc-700 leading-relaxed">{summary}</p>
      </div>

      {/* Gaps */}
      {gaps.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Gaps ({gaps.length})
          </p>
          <ul className="space-y-3">
            {gaps.map((gap, i) => {
              const sc = statusConfig[gap.status];
              return (
                <li key={i} className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={['rounded px-1.5 py-0.5 text-xs font-semibold', sc.className].join(' ')}>
                      {sc.label}
                    </span>
                    <span className="text-xs text-zinc-400">{gap.category}</span>
                  </div>
                  <p className={['text-sm', importanceClass(gap.importance)].join(' ')}>
                    {gap.item}
                  </p>
                  {gap.suggestion && (
                    <p className="text-xs text-zinc-500 italic">{gap.suggestion}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Strengths</p>
          <ul className="space-y-1.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                <span className="mt-0.5 text-green-500 flex-shrink-0">&#10003;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Suggested Improvements
          </p>
          <ul className="space-y-1.5">
            {improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-700">
                <span className="mt-0.5 text-zinc-400 flex-shrink-0">&#8594;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Step 3 — Review & Rewrite ────────────────────────────────────────────────

function Step3({
  state,
  onGenerate,
  onBack,
}: {
  state: WizardState;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const { analysis } = state;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Review &amp; Generate</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Review how your resume matches the job, then generate a tailored version.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Gap Analysis */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Gap Analysis
          </h3>
          {analysis && <GapAnalysisPanel analysis={analysis} />}
        </div>

        {/* Right: Generate CTA */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Tailored Resume
          </h3>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="mb-1 text-sm font-medium text-zinc-800">Ready to generate</p>
            <p className="mb-6 text-xs text-zinc-500">
              Your resume will be tailored to the job description and automatically saved.
            </p>
            <button
              type="button"
              onClick={onGenerate}
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Generate Tailored Resume
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Export PDF ──────────────────────────────────────────────────────

function Step4({
  state,
  dispatch,
  getResumeMarkdown,
  onBack,
  userName,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  getResumeMarkdown: () => string;
  onBack: () => void;
  userName: string;
}) {
  const {
    analysis,
    resultMarkdown,
    resultEditedMarkdown,
    jdText,
    company,
    role,
    selectedResumeId,
    saving,
    saveError,
    savedApplicationId,
    pdfLoading,
    pdfError,
  } = state;

  const finalMarkdown = resultEditedMarkdown || resultMarkdown;

  function handleDownload() {
    const blob = new Blob([finalMarkdown], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildFilename(userName, role, company, 'md');
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPdf() {
    dispatch({ type: 'SET_PDF_LOADING', value: true });

    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: finalMarkdown,
          template: 'kan',
          lang: state.outputLang,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        dispatch({
          type: 'SET_PDF_ERROR',
          error: data.message || data.error || `PDF generation failed (${res.status})`,
        });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = buildFilename(userName, state.role, state.company, 'pdf');
      a.click();
      URL.revokeObjectURL(url);

      dispatch({ type: 'SET_PDF_LOADING', value: false });
    } catch (err) {
      dispatch({
        type: 'SET_PDF_ERROR',
        error: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    }
  }

  async function handleSave() {
    dispatch({ type: 'SET_SAVING', value: true });

    try {
      const res = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId ?? undefined,
          jdText: jdText.trim(),
          company: company.trim() || undefined,
          role: role.trim() || undefined,
          outputLang: state.outputLang,
          sourceMarkdown: getResumeMarkdown(),
          analysisJson: analysis,
          resultMarkdown: finalMarkdown,
          provider: 'deepseek',
          model: 'deepseek-chat',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        dispatch({
          type: 'SET_SAVE_ERROR',
          error: data.error || `Save failed (${res.status})`,
        });
        return;
      }

      const data = await res.json();
      dispatch({ type: 'SET_SAVED', applicationId: data.application.id });
    } catch (err) {
      dispatch({
        type: 'SET_SAVE_ERROR',
        error: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Export &amp; Save</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Download your tailored resume or save this application for later.
        </p>
      </div>

      {/* Final markdown preview */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <h3 className="text-sm font-medium text-zinc-700">Final Resume</h3>
          <span className="text-xs text-zinc-400">{finalMarkdown.length.toLocaleString()} chars</span>
        </div>
        <pre className="max-h-96 overflow-auto px-4 py-4 font-mono text-xs text-zinc-700 whitespace-pre-wrap leading-relaxed">
          {finalMarkdown}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Download as .md
        </button>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={pdfLoading}
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
          >
            {pdfLoading && <Spinner size="sm" light />}
            {pdfLoading ? 'Generating PDF…' : 'Download PDF'}
          </button>
          {pdfError && (
            <p className="text-xs text-red-600">{pdfError}</p>
          )}
        </div>
      </div>

      {/* Save section */}
      {savedApplicationId ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-sm font-medium text-green-800">Application saved successfully!</p>
          <p className="mt-1 text-xs text-green-600">
            Your tailored resume and analysis have been saved.
          </p>
          <a
            href="/app"
            className="mt-3 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Back to Dashboard
          </a>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-semibold text-zinc-800">Save this application</h3>
          <p className="mb-4 text-xs text-zinc-500">
            Saves the resume, job description, gap analysis, and tailored output so you can review it later.
          </p>

          {saveError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
          >
            {saving && <Spinner size="sm" light />}
            {saving ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      )}

      <div className="flex justify-start border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildFilename(name: string, role: string, company: string, ext: string): string {
  const parts = [name || 'Resume', role || 'Role', company || 'Company'];
  return parts.join(' - ').replace(/[/\\?%*:|"<>]/g, '').trim() + '.' + ext;
}

// ─── ProcessingScreen ─────────────────────────────────────────────────────────

function ProcessingScreen({
  phase,
  error,
  onStartNew,
  onRetry,
}: {
  phase: 'rewriting' | 'saving' | null;
  error: string | null;
  onStartNew: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 py-24 text-center shadow-sm">
      {error ? (
        <>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-zinc-900">Something went wrong</h2>
          <p className="mb-8 max-w-sm text-sm text-zinc-500">{error}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onStartNew}
              className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Start New Application
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative mb-8">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-zinc-100 border-t-zinc-900" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-zinc-900">
            {phase === 'saving' ? 'Saving your application…' : 'Generating your tailored resume…'}
          </h2>
          <p className="mb-10 text-sm text-zinc-500">
            {phase === 'saving'
              ? 'Almost done — saving everything for you.'
              : 'This usually takes 15–30 seconds. Feel free to start a new one while you wait.'}
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Start New Application
          </button>
        </>
      )}
    </div>
  );
}

// ─── Snackbar ─────────────────────────────────────────────────────────────────

function Snackbar({ durationMs, onDismiss }: { durationMs: number; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const secs = Math.round(durationMs / 1000);
  const durationLabel = secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-zinc-900 px-5 py-4 text-white shadow-2xl">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
        <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold">Resume ready!</p>
        <p className="text-xs text-zinc-400">Generated in {durationLabel} &middot; saved to history.</p>
      </div>
      <a
        href="/app/history"
        className="ml-2 whitespace-nowrap rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/20"
      >
        View History →
      </a>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 flex-shrink-0 text-zinc-400 transition-colors hover:text-white"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size = 'md', light = false }: { size?: 'sm' | 'md'; light?: boolean }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const colorClass = light ? 'border-white/30 border-t-white' : 'border-zinc-200 border-t-zinc-700';
  return (
    <span
      className={[
        'inline-block flex-shrink-0 animate-spin rounded-full border-2',
        sizeClass,
        colorClass,
      ].join(' ')}
      role="status"
      aria-label="Loading"
    />
  );
}

// ─── WizardClient ─────────────────────────────────────────────────────────────

export default function WizardClient({ userName = '' }: { userName?: string }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // Fetch resumes on mount
  useEffect(() => {
    dispatch({ type: 'SET_RESUMES_LOADING' });
    fetch('/api/resume')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load resumes (${res.status})`);
        return res.json();
      })
      .then((data: { resumes: Resume[] }) => {
        dispatch({ type: 'SET_RESUMES', resumes: data.resumes });
        // Auto-select default resume if present
        const def = data.resumes.find((r) => r.isDefault) ?? data.resumes[0];
        if (def) dispatch({ type: 'SELECT_RESUME', id: def.id });
      })
      .catch((err: Error) => {
        dispatch({ type: 'SET_RESUMES_ERROR', error: err.message });
      });
  }, []);

  function getResumeMarkdown(): string {
    if (state.usePasted) return state.pastedMarkdown;
    return state.resumes.find((r) => r.id === state.selectedResumeId)?.markdown ?? '';
  }

  function goTo(step: 1 | 2 | 3 | 4) {
    dispatch({ type: 'GO_TO_STEP', step });
  }

  async function handleGenerate() {
    dispatch({ type: 'START_PROCESSING' });
    dispatch({ type: 'SET_RESULT_MARKDOWN', text: '' });
    dispatch({ type: 'SET_RESULT_EDITED_MARKDOWN', text: '' });
    dispatch({ type: 'SET_REWRITE_DONE', value: false });

    const startTime = Date.now();
    let finalMd = '';

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeMarkdown: getResumeMarkdown(),
          jdText: state.jdText.trim(),
          outputLang: state.outputLang,
        }),
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        dispatch({ type: 'SET_PROCESSING_ERROR', error: text || `Error ${res.status}` });
        return;
      }

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice('data: '.length)) as
              | { type: 'chunk'; content: string }
              | { type: 'done' }
              | { type: 'error'; message: string };
            if (event.type === 'chunk') {
              finalMd = event.content;
              dispatch({ type: 'SET_RESULT_MARKDOWN', text: event.content });
            } else if (event.type === 'done') {
              dispatch({ type: 'SET_REWRITE_DONE', value: true });
            } else if (event.type === 'error') {
              dispatch({ type: 'SET_PROCESSING_ERROR', error: event.message });
              return;
            }
          } catch { /* skip malformed SSE */ }
        }
      }

      dispatch({ type: 'SET_PROCESSING_PHASE', phase: 'saving' });

      const durationMs = Date.now() - startTime;

      const saveRes = await fetch('/api/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: state.selectedResumeId ?? undefined,
          jdText: state.jdText.trim(),
          company: state.company.trim() || undefined,
          role: state.role.trim() || undefined,
          outputLang: state.outputLang,
          sourceMarkdown: getResumeMarkdown(),
          analysisJson: state.analysis,
          resultMarkdown: finalMd,
          provider: 'deepseek',
          model: 'deepseek-chat',
          durationMs,
        }),
      });

      if (!saveRes.ok) {
        const data = await saveRes.json().catch(() => ({}));
        dispatch({ type: 'SET_PROCESSING_ERROR', error: data.error || `Save failed (${saveRes.status})` });
        return;
      }

      const saveData = await saveRes.json();
      dispatch({ type: 'SHOW_SNACKBAR', appId: saveData.application.id, durationMs });
    } catch (err) {
      dispatch({
        type: 'SET_PROCESSING_ERROR',
        error: err instanceof Error ? err.message : 'An unexpected error occurred.',
      });
    }
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Step indicator */}
        <div className="mb-10">
          <StepIndicator currentStep={state.step} />
        </div>

        {/* Processing screen replaces step content while generating */}
        {state.processingView ? (
          <ProcessingScreen
            phase={state.processingPhase}
            error={state.processingError}
            onStartNew={() => { window.location.href = '/app/new'; }}
            onRetry={() => {
              dispatch({ type: 'CANCEL_PROCESSING' });
            }}
          />
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            {state.step === 1 && (
              <Step1
                state={state}
                dispatch={dispatch}
                onNext={() => goTo(2)}
              />
            )}
            {state.step === 2 && (
              <Step2
                state={state}
                dispatch={dispatch}
                getResumeMarkdown={getResumeMarkdown}
                onBack={() => goTo(1)}
              />
            )}
            {state.step === 3 && (
              <Step3
                state={state}
                onGenerate={handleGenerate}
                onBack={() => goTo(2)}
              />
            )}
            {state.step === 4 && (
              <Step4
                state={state}
                dispatch={dispatch}
                getResumeMarkdown={getResumeMarkdown}
                onBack={() => goTo(3)}
                userName={userName}
              />
            )}
          </div>
        )}
      </div>

      {/* Snackbar */}
      {state.snackbar && (
        <Snackbar
          durationMs={state.snackbar.durationMs}
          onDismiss={() => dispatch({ type: 'DISMISS_SNACKBAR' })}
        />
      )}
    </>
  );
}
