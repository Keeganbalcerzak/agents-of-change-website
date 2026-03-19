"use client";

import { useMemo, useState, type ComponentProps } from "react";
import { US_STATES } from "@/lib/states";
import type { StateRequirement } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

interface AiTrackerFormProps {
  stateRequirements: StateRequirement[];
}

interface FormErrors {
  state?: string;
  examDate?: string;
}

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function isPastDate(dateInput: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(dateInput) < today;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export default function AiTrackerForm({ stateRequirements }: AiTrackerFormProps) {
  const [stateCode, setStateCode] = useState("");
  const [examDate, setExamDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const stateRequirementMap = useMemo(() => {
    const entries = stateRequirements.map((entry) => [entry.stateCode.toUpperCase(), entry] as const);
    return new Map(entries);
  }, [stateRequirements]);

  const selectedRequirement = stateCode ? stateRequirementMap.get(stateCode) : undefined;

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!stateCode) {
      nextErrors.state = "Please select your planned practice state.";
    }

    if (!examDate) {
      nextErrors.examDate = "Please select your planned exam date.";
    } else if (isPastDate(examDate)) {
      nextErrors.examDate = "Exam date must be today or later.";
    }

    return nextErrors;
  };

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitted(true);
    trackEvent("tracker_workflow_preview", {
      state: stateCode,
      renewal_cycle_years: selectedRequirement?.renewalCycleYears ?? 2,
    });
  };

  const resetForm = () => {
    setSubmitted(false);
    setStateCode("");
    setExamDate("");
    setErrors({});
  };

  const parsedExamDate = examDate ? parseLocalDate(examDate) : null;
  const renewalCycleYears = selectedRequirement?.renewalCycleYears ?? 2;
  const ceHoursRequired = selectedRequirement?.ceHoursRequired ?? 30;
  const examCheckIn = parsedExamDate;
  const passConfirmation = parsedExamDate ? addDays(parsedExamDate, 2) : null;
  const renewalDate = parsedExamDate ? addYears(parsedExamDate, renewalCycleYears) : null;
  const ceReminderStart = renewalDate ? addDays(renewalDate, -90) : null;

  return (
    <div className="tracker-form-shell">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="tracker-form" noValidate>
          <div className="tracker-form-field">
            <label htmlFor="tracker-state">Where do you plan to practice?</label>
            <select
              id="tracker-state"
              value={stateCode}
              onChange={(event) => {
                setStateCode(event.target.value);
                setErrors((prev) => ({ ...prev, state: undefined }));
              }}
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? "tracker-state-error" : undefined}
              required
            >
              <option value="">Select a state</option>
              {US_STATES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.name}
                </option>
              ))}
            </select>
            {errors.state && (
              <p id="tracker-state-error" className="field-error" role="alert">
                {errors.state}
              </p>
            )}
            {selectedRequirement && (
              <p className="tracker-state-note" aria-live="polite">
                {selectedRequirement.stateName}: {ceHoursRequired} CE hours every {renewalCycleYears} years.
                {" "}
                {selectedRequirement.ceNotes ?? "Verify final category details with your board."}
              </p>
            )}
          </div>

          <div className="tracker-form-field">
            <label htmlFor="tracker-exam-date">Planned exam date</label>
            <input
              id="tracker-exam-date"
              type="date"
              value={examDate}
              onChange={(event) => {
                setExamDate(event.target.value);
                setErrors((prev) => ({ ...prev, examDate: undefined }));
              }}
              aria-invalid={Boolean(errors.examDate)}
              aria-describedby={errors.examDate ? "tracker-date-error" : undefined}
              required
            />
            {errors.examDate && (
              <p id="tracker-date-error" className="field-error" role="alert">
                {errors.examDate}
              </p>
            )}
          </div>

          <button type="submit" className="button primary block">
            Build AI Tracker timeline
          </button>
        </form>
      ) : (
        <div className="tracker-preview" aria-live="polite">
          <h3>Tracker preview ready</h3>
          <p>
            This workflow shows how Agents of Change can guide your exam check-in and CE reminders after licensure.
          </p>

          <ol className="tracker-timeline">
            <li>
              <p className="tracker-date">{examCheckIn ? formatDate(examCheckIn) : "TBD"}</p>
              <p className="tracker-title">Exam-day check-in</p>
              <p>Automated prompt asks whether you passed and confirms your next milestone.</p>
            </li>
            <li>
              <p className="tracker-date">{passConfirmation ? formatDate(passConfirmation) : "TBD"}</p>
              <p className="tracker-title">If passed: licensure transition</p>
              <p>Tracker records your timeline and activates CE planning for {selectedRequirement?.stateName ?? "your state"}.</p>
            </li>
            <li>
              <p className="tracker-date">{ceReminderStart ? formatDate(ceReminderStart) : "TBD"}</p>
              <p className="tracker-title">CE reminder start</p>
              <p>
                Reminder campaign starts 90 days before renewal to complete {ceHoursRequired} CE hours.
              </p>
            </li>
            <li>
              <p className="tracker-date">{renewalDate ? formatDate(renewalDate) : "TBD"}</p>
              <p className="tracker-title">Renewal milestone</p>
              <p>
                Target renewal date based on a {renewalCycleYears}-year cadence.
                {" "}
                {selectedRequirement?.ceNotes ?? "Confirm board-specific CE categories before final submission."}
              </p>
            </li>
          </ol>

          <button type="button" className="button secondary block" onClick={resetForm}>
            Reset tracker
          </button>
        </div>
      )}
    </div>
  );
}
