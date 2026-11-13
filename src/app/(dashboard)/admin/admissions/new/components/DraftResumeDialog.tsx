"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileClock,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

interface DraftResumeDialogProps {
  open: boolean;
  studentName: string;
  stepName: string;
  savedAt: number;
  onResume: () => void;
  onStartNew: () => void;
}

const ADMISSION_STEPS = [
  "Student",
  "Parent",
  "Academic",
  "Documents",
  "Review",
];

function formatSavedDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "Saved previously";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Saved previously";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function DraftResumeDialog({
  open,
  studentName,
  stepName,
  savedAt,
  onResume,
  onStartNew,
}: DraftResumeDialogProps) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (!open) return null;

  const displayName = studentName.trim() || "New student admission";

  const currentStepIndex = ADMISSION_STEPS.findIndex(
    (step) => step.toLowerCase() === stepName?.trim().toLowerCase(),
  );

  const progress =
    currentStepIndex >= 0
      ? Math.round(((currentStepIndex + 1) / ADMISSION_STEPS.length) * 100)
      : 0;

  return (
    <div
      className="
        fixed inset-0 z-[200]
        flex items-start justify-center
        overflow-y-auto overscroll-contain
        bg-slate-950/50
        px-4 py-5
        backdrop-blur-[3px]
        sm:items-center sm:py-8
      "
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          // Intentionally keep the dialog open until the user chooses
          // Resume Draft or Start New Admission.
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-dialog-title"
        aria-describedby="draft-dialog-description"
        className="my-auto flex w-full max-w-[440px] flex-col max-h-[min(480px,calc(100dvh-2rem))] 
        overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header: remains visible while the details scroll */}
        <header className="shrink-0 border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white 
        to-white px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border 
            border-sky-100 bg-white text-sky-700 shadow-sm">
              <FileClock className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="draft-dialog-title"
                  className="text-md font-bold tracking-tight text-slate-900"
                >
                  Resume your admission
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 
                text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Draft found
                </span>
              </div>

              <p
                id="draft-dialog-description"
                className="mt-1.5 text-xs leading-5 text-slate-500"
              >
                Continue your unfinished admission without entering the details
                again.
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
          {/* Student and saved information */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            {/* <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white 
              text-slate-600 shadow-sm">
                <UserRound className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Student
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                  {displayName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Unfinished admission draft
                </p>
              </div>
            </div>

            <div className="my-4 border-t border-slate-200" /> */}

            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Last step
                </p>

                <p className="mt-1.5 break-words text-xs font-semibold text-slate-800">
                  {stepName || "Student"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Last saved
                </p>

                <div className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-slate-700">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                  <span className="break-words">
                    {formatSavedDate(savedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admission progress */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-700">
                Admission progress
              </p>

              <p className="text-xs font-bold text-sky-700">
                {progress > 0 ? `${progress}%` : "In progress"}
              </p>
            </div>

            <div
              className="h-1 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Admission step progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-sky-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1">
              {ADMISSION_STEPS.map((step, index) => {
                const isCurrent = index === currentStepIndex;
                const isPast =
                  currentStepIndex >= 0 && index < currentStepIndex;

                return (
                  <div key={step} className="min-w-0 text-center">
                    <div
                      className={`
                        mx-auto flex h-6 w-6 items-center justify-center
                        rounded-full text-[10px] font-semibold
                        ${
                          isCurrent
                            ? "bg-sky-600 text-white"
                            : isPast
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-400"
                        }
                      `}
                    >
                      {isPast ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <p
                      className={`
                        mt-1.5 truncate text-[9px]
                        ${
                          isCurrent
                            ? "font-bold text-sky-700"
                            : "text-slate-400"
                        }
                      `}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reassurance */}
          <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-emerald-50 px-3.5 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

            <p className="text-xs leading-5 text-emerald-800">
              Resume your saved draft to continue with the remaining admission
              details.
            </p>
          </div>

          {/* Discard confirmation */}
          {confirmDiscard && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-900">
                    Discard this admission draft?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-700">
                    The saved progress will be deleted. This action cannot be
                    undone.
                  </p>

                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDiscard(false)}
                      className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 
                      text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Keep draft
                    </button>

                    <button
                      type="button"
                      onClick={onStartNew}
                      className="min-h-9 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold 
                      text-white hover:bg-red-700"
                    >
                      Discard draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed footer: stays accessible while body scrolls */}
        <footer className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setConfirmDiscard(true)}
              disabled={confirmDiscard}
              className="
                inline-flex min-h-10 items-center justify-center gap-2
                rounded-lg border border-slate-200 bg-white px-4 py-2
                text-sm font-medium text-slate-600 transition
                hover:border-red-200 hover:bg-red-50 hover:text-red-700
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              <Trash2 className="h-4 w-4" />
              Start new admission
            </button>

            <button
              type="button"
              onClick={onResume}
              className="
                inline-flex min-h-10 items-center justify-center gap-2
                rounded-lg bg-sky-600 px-5 py-2.5
                text-sm font-semibold text-white shadow-sm transition
                hover:bg-sky-700
                focus:outline-none focus:ring-2
                focus:ring-sky-500 focus:ring-offset-2
              "
            >
              <RotateCcw className="h-4 w-4" />
              Resume draft
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
