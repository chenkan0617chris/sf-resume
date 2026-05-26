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
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all"
                style={
                  isDone
                    ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff' }
                    : isCurrent
                    ? {
                        background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                        color: '#fff',
                        boxShadow: '0 0 0 4px rgba(124,58,237,0.2), 0 0 16px rgba(124,58,237,0.4)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#52525b',
                      }
                }
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
                className="text-xs font-medium whitespace-nowrap"
                style={
                  isCurrent
                    ? { color: '#e9d5ff' }
                    : isDone
                    ? { color: '#7c3aed' }
                    : { color: '#3f3f46' }
                }
              >
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className="mx-3 mb-5 h-px w-16 flex-shrink-0"
                style={
                  isDone
                    ? { background: 'linear-gradient(90deg,#7c3aed,#a855f7)' }
                    : { background: 'rgba(255,255,255,0.07)' }
                }
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
        <h2 className="text-xl font-extrabold text-[#f4f4f5]">Select a resume</h2>
        <p className="mt-1 text-sm text-[#52525b]">
          Choose a saved resume or paste your resume as markdown text.
        </p>
      </div>

      {resumesLoading && (
        <div className="flex items-center gap-2 text-sm text-[#71717a]">
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
        <div
          className="rounded-lg px-4 py-6 text-center text-sm text-[#71717a]"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
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
                className="flex flex-col gap-1 rounded-xl p-4 text-left transition-all"
                style={
                  isSelected
                    ? { background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                <span
                  className="font-medium"
                  style={{ color: isSelected ? '#e9d5ff' : '#d4d4d8' }}
                >
                  {resume.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: isSelected ? '#a78bfa' : '#52525b' }}
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
                    className="mt-1 w-fit text-xs font-medium text-[#c084fc]"
                    style={{
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.25)',
                      borderRadius: 6,
                      padding: '2px 6px',
                    }}
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
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={usePasted}
            onChange={(e) => dispatch({ type: 'SET_USE_PASTED', value: e.target.checked })}
            className="h-4 w-4 rounded accent-[#7c3aed]"
            style={{ borderColor: 'rgba(255,255,255,0.09)' }}
          />
          <span className="text-sm font-medium text-[#d4d4d8]">Paste resume as text instead</span>
        </label>

        {usePasted && (
          <textarea
            className="mt-3 w-full rounded-lg font-mono text-xs placeholder-[#3f3f46] focus:outline-none resize-y focus:border-[#7c3aed]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10,
              color: '#d4d4d8',
              padding: '12px',
            }}
            rows={12}
            placeholder={`# Jane Smith\n\n## Experience\n\n### Software Engineer — Acme Corp\n*Jan 2022 – Present*\n\n- Built features...`}
            value={pastedMarkdown}
            onChange={(e) => dispatch({ type: 'SET_PASTED_MARKDOWN', text: e.target.value })}
          />
        )}
      </div>

      {/* Preview */}
      {activeMarkdown && (
        <details
          className="rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[#71717a] hover:text-[#a1a1aa]">
            Preview selected resume ({activeMarkdown.length.toLocaleString()} chars)
          </summary>
          <pre
            className="max-h-48 overflow-auto px-4 py-3 font-mono text-xs text-[#a1a1aa] whitespace-pre-wrap"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            {activeMarkdown}
          </pre>
        </details>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            boxShadow: '0 0 20px rgba(124,58,237,0.35)',
            borderRadius: 10,
          }}
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
        <h2 className="text-xl font-extrabold text-[#f4f4f5]">Job Description</h2>
        <p className="mt-1 text-sm text-[#52525b]">
          Paste the full job description. The more detail, the better the analysis.
        </p>
      </div>

      {/* Language toggle */}
      <div
        className="flex items-center gap-0.5 w-fit"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: 3,
        }}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_OUTPUT_LANG', lang: 'en' })}
          className="px-3 py-1 text-sm font-semibold transition-colors"
          style={
            state.outputLang === 'en'
              ? {
                  background: 'rgba(124,58,237,0.25)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 6,
                  color: '#c084fc',
                }
              : { color: '#52525b', border: '1px solid transparent', borderRadius: 6 }
          }
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_OUTPUT_LANG', lang: 'zh' })}
          className="px-3 py-1 text-sm font-semibold transition-colors"
          style={
            state.outputLang === 'zh'
              ? {
                  background: 'rgba(124,58,237,0.25)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 6,
                  color: '#c084fc',
                }
              : { color: '#52525b', border: '1px solid transparent', borderRadius: 6 }
          }
        >
          中文
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#71717a]">
            Company name <span className="text-[#3f3f46] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => dispatch({ type: 'SET_COMPANY', text: e.target.value })}
            placeholder="Acme Corp"
            className="w-full px-3 py-2 text-sm placeholder-[#3f3f46] focus:outline-none focus:border-[#7c3aed]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10,
              color: '#d4d4d8',
            }}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#71717a]">
            Role / title <span className="text-[#3f3f46] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => dispatch({ type: 'SET_ROLE', text: e.target.value })}
            placeholder="Senior Software Engineer"
            className="w-full px-3 py-2 text-sm placeholder-[#3f3f46] focus:outline-none focus:border-[#7c3aed]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10,
              color: '#d4d4d8',
            }}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#71717a]">
          Job description <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full p-3 text-sm placeholder-[#3f3f46] focus:outline-none focus:border-[#7c3aed] resize-y"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            color: '#d4d4d8',
          }}
          rows={14}
          placeholder="Paste the full job description here (at least 50 characters)..."
          value={jdText}
          onChange={(e) => dispatch({ type: 'SET_JD_TEXT', text: e.target.value })}
        />
        <p className="mt-1 text-xs text-[#3f3f46]">
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
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-4 text-sm text-[#a1a1aa]"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Spinner size="md" />
          <span>Analyzing your resume fit...</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={analyzing}
          className="px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            color: '#71717a',
          }}
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canAnalyze}
          onClick={handleAnalyze}
          className="px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            boxShadow: '0 0 20px rgba(124,58,237,0.35)',
            borderRadius: 10,
          }}
        >
          Analyze
        </button>
      </div>
    </div>
  );
}

// ─── Gap Analysis sub-panel ───────────────────────────────────────────────────

const statusConfig: Record<GapStatus, { label: string; style: React.CSSProperties }> = {
  missing: {
    label: 'Missing',
    style: { background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 4, padding: '2px 6px' },
  },
  partial: {
    label: 'Partial',
    style: { background: 'rgba(234,179,8,0.15)', color: '#fbbf24', borderRadius: 4, padding: '2px 6px' },
  },
  matched: {
    label: 'Matched',
    style: { background: 'rgba(34,197,94,0.12)', color: '#4ade80', borderRadius: 4, padding: '2px 6px' },
  },
};

function importanceClass(imp: Importance): string {
  if (imp === 'high') return 'font-bold text-[#e4e4e7]';
  if (imp === 'medium') return 'font-normal text-[#a1a1aa]';
  return 'font-normal text-[#52525b]';
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const fillColor =
    value >= 70 ? 'rgba(34,197,94,0.7)' : value >= 40 ? 'rgba(234,179,8,0.7)' : 'rgba(239,68,68,0.7)';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium capitalize" style={{ color: '#71717a' }}>{label}</span>
        <span style={{ color: '#52525b' }}>{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${value}%`, background: fillColor }}
        />
      </div>
    </div>
  );
}

function GapAnalysisPanel({ analysis }: { analysis: AnalysisJson }) {
  const { score, scoreBreakdown, summary, gaps, strengths, improvements } = analysis;

  const scoreBadgeStyle: React.CSSProperties =
    score >= 70
      ? { background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', color: '#4ade80' }
      : score >= 40
      ? { background: 'rgba(234,179,8,0.12)', border: '2px solid rgba(234,179,8,0.3)', color: '#fbbf24' }
      : { background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)', color: '#f87171' };

  const scoreTextColor = score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171';

  const panelStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
  };

  return (
    <div className="space-y-5">
      {/* Score badge */}
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold"
          style={scoreBadgeStyle}
        >
          {score}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#3f3f46]">Overall Score</p>
          <p className="text-2xl font-bold" style={{ color: scoreTextColor }}>
            {score}<span className="text-sm font-normal text-[#3f3f46]">/100</span>
          </p>
        </div>
      </div>

      {/* Breakdown bars */}
      <div className="p-4 space-y-3" style={panelStyle}>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">Breakdown</p>
        {(Object.entries(scoreBreakdown) as [string, number][]).map(([key, val]) => (
          <ScoreBar key={key} label={key} value={val} />
        ))}
      </div>

      {/* Summary */}
      <div className="p-4" style={panelStyle}>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">Summary</p>
        <p className="text-sm text-[#a1a1aa] leading-relaxed">{summary}</p>
      </div>

      {/* Gaps */}
      {gaps.length > 0 && (
        <div className="p-4" style={panelStyle}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">
            Gaps ({gaps.length})
          </p>
          <ul className="space-y-3">
            {gaps.map((gap, i) => {
              const sc = statusConfig[gap.status];
              return (
                <li
                  key={i}
                  className="flex flex-col gap-1 rounded-lg p-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold" style={sc.style}>
                      {sc.label}
                    </span>
                    <span className="text-xs text-[#52525b]">{gap.category}</span>
                  </div>
                  <p className={['text-sm', importanceClass(gap.importance)].join(' ')}>
                    {gap.item}
                  </p>
                  {gap.suggestion && (
                    <p className="text-xs text-[#71717a] italic">{gap.suggestion}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="p-4" style={panelStyle}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">Strengths</p>
          <ul className="space-y-1.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }}>&#10003;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="p-4" style={panelStyle}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#3f3f46]">
            Suggested Improvements
          </p>
          <ul className="space-y-1.5">
            {improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                <span className="mt-0.5 flex-shrink-0 text-[#52525b]">&#8594;</span>
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
        <h2 className="text-xl font-extrabold text-[#f4f4f5]">Review &amp; Generate</h2>
        <p className="mt-1 text-sm text-[#52525b]">
          Review how your resume matches the job, then generate a tailored version.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Gap Analysis */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#3f3f46]">
            Gap Analysis
          </h3>
          {analysis && <GapAnalysisPanel analysis={analysis} />}
        </div>

        {/* Right: Generate CTA */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#3f3f46]">
            Tailored Resume
          </h3>
          <div
            className="flex flex-col items-center justify-center rounded-xl px-6 py-12 text-center"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(124,58,237,0.25)',
            }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="mb-1 text-sm font-medium text-[#d4d4d8]">Ready to generate</p>
            <p className="mb-6 text-xs text-[#52525b]">
              Your resume will be tailored to the job description and automatically saved.
            </p>
            <button
              type="button"
              onClick={onGenerate}
              className="px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                boxShadow: '0 0 20px rgba(124,58,237,0.35)',
                borderRadius: 10,
              }}
            >
              Generate Tailored Resume
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-start pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            color: '#71717a',
          }}
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
        <h2 className="text-xl font-extrabold text-[#f4f4f5]">Export &amp; Save</h2>
        <p className="mt-1 text-sm text-[#52525b]">
          Download your tailored resume or save this application for later.
        </p>
      </div>

      {/* Final markdown preview */}
      <div
        className="rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <h3 className="text-sm font-medium text-[#71717a]">Final Resume</h3>
          <span className="text-xs text-[#3f3f46]">{finalMarkdown.length.toLocaleString()} chars</span>
        </div>
        <pre className="max-h-96 overflow-auto px-4 py-4 font-mono text-xs text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
          {finalMarkdown}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="px-5 py-2.5 text-sm font-medium transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            color: '#71717a',
          }}
        >
          Download as .md
        </button>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={pdfLoading}
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              boxShadow: '0 0 20px rgba(124,58,237,0.35)',
              borderRadius: 10,
            }}
          >
            {pdfLoading && <Spinner size="sm" light />}
            {pdfLoading ? 'Generating PDF…' : 'Download PDF'}
          </button>
          {pdfError && (
            <p className="text-xs text-red-500">{pdfError}</p>
          )}
        </div>
      </div>

      {/* Save section */}
      {savedApplicationId ? (
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
          }}
        >
          <p className="text-sm font-medium text-[#4ade80]">Application saved successfully!</p>
          <p className="mt-1 text-xs" style={{ color: '#4ade80', opacity: 0.7 }}>
            Your tailored resume and analysis have been saved.
          </p>
          <a
            href="/app"
            className="mt-3 inline-block px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              boxShadow: '0 0 20px rgba(124,58,237,0.35)',
              borderRadius: 10,
            }}
          >
            Back to Dashboard
          </a>
        </div>
      ) : (
        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 className="mb-1 text-sm font-semibold text-[#d4d4d8]">Save this application</h3>
          <p className="mb-4 text-xs text-[#52525b]">
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
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              boxShadow: '0 0 20px rgba(124,58,237,0.35)',
              borderRadius: 10,
            }}
          >
            {saving && <Spinner size="sm" light />}
            {saving ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      )}

      <div
        className="flex justify-start pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-40"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10,
            color: '#71717a',
          }}
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
    <div
      className="flex min-h-80 flex-col items-center justify-center rounded-2xl px-8 py-24 text-center"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.18)' }}
    >
      {error ? (
        <>
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(239,68,68,0.12)' }}
          >
            <svg className="h-7 w-7" style={{ color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[#f4f4f5]">Something went wrong</h2>
          <p className="mb-8 max-w-sm text-sm text-[#a1a1aa]">{error}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                boxShadow: '0 0 20px rgba(124,58,237,0.35)',
                borderRadius: 10,
              }}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onStartNew}
              className="px-5 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 10,
                color: '#71717a',
              }}
            >
              Start New Application
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative mb-8">
            <div
              className="h-20 w-20 animate-spin rounded-full border-4"
              style={{
                borderColor: 'rgba(124,58,237,0.15)',
                borderTopColor: '#a855f7',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-8 w-8 text-[#3f3f46]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[#f4f4f5]">
            {phase === 'saving' ? 'Saving your application…' : 'Generating your tailored resume…'}
          </h2>
          <p className="mb-10 text-sm text-[#a1a1aa]">
            {phase === 'saving'
              ? 'Almost done — saving everything for you.'
              : 'This usually takes 15–30 seconds. Feel free to start a new one while you wait.'}
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="px-5 py-2.5 text-sm font-medium transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 10,
              color: '#71717a',
            }}
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
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 text-white shadow-2xl"
      style={{ background: '#111118', border: '1px solid rgba(124,58,237,0.25)' }}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
        <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold text-[#f4f4f5]">Resume ready!</p>
        <p className="text-xs text-[#71717a]">Generated in {durationLabel} &middot; saved to history.</p>
      </div>
      <a
        href="/app/history"
        className="ml-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
        style={{ background: 'rgba(124,58,237,0.2)', color: '#c084fc' }}
      >
        View History →
      </a>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 flex-shrink-0 transition-colors hover:text-white"
        style={{ color: '#52525b' }}
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
  const colorClass = light
    ? 'border-white/20 border-t-white'
    : 'border-[rgba(124,58,237,0.15)] border-t-[#a855f7]';
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
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.18)' }}
          >
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
