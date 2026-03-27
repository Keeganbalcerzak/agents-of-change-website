"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
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

const validStateCodes = new Set(US_STATES.map((entry) => entry.code));

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

function normalizeStateCode(value: string | null): string {
  if (!value) {
    return "";
  }

  const normalized = value.trim().toUpperCase();
  return validStateCodes.has(normalized) ? normalized : "";
}

function isValidDateInput(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseLocalDate(value).valueOf());
}

function formatIcsDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function downloadIcsFile(filename: string, content: string) {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

async function copyTextToClipboard(value: string): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    await window.navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export default function AiTrackerForm({ stateRequirements }: AiTrackerFormProps) {
  const [stateCode, setStateCode] = useState("");
  const [examDate, setExamDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");

  const stateRequirementMap = useMemo(() => {
    const entries = stateRequirements.map((entry) => [entry.stateCode.toUpperCase(), entry] as const);
    return new Map(entries);
  }, [stateRequirements]);

  const selectedRequirement = stateCode ? stateRequirementMap.get(stateCode) : undefined;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextStateCode = normalizeStateCode(params.get("state"));
    const nextExamDate = params.get("examDate") ?? "";

    if (nextStateCode) {
      setStateCode(nextStateCode);
    }

    if (isValidDateInput(nextExamDate)) {
      setExamDate(nextExamDate);

      if (nextStateCode && !isPastDate(nextExamDate)) {
        setSubmitted(true);
      }
    }
  }, []);

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

  const syncQueryParams = (nextStateCode: string, nextExamDate: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (nextStateCode) {
      nextUrl.searchParams.set("state", nextStateCode);
    } else {
      nextUrl.searchParams.delete("state");
    }

    if (nextExamDate) {
      nextUrl.searchParams.set("examDate", nextExamDate);
    } else {
      nextUrl.searchParams.delete("examDate");
    }

    window.history.replaceState({}, "", nextUrl);
  };

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setShareStatus("idle");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitted(true);
    syncQueryParams(stateCode, examDate);
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
    setShareStatus("idle");
    syncQueryParams("", "");
  };

  const parsedExamDate = examDate ? parseLocalDate(examDate) : null;
  const renewalCycleYears = selectedRequirement?.renewalCycleYears ?? 2;
  const ceHoursRequired = selectedRequirement?.ceHoursRequired ?? 30;
  const examCheckIn = parsedExamDate;
  const passConfirmation = parsedExamDate ? addDays(parsedExamDate, 2) : null;
  const renewalDate = parsedExamDate ? addYears(parsedExamDate, renewalCycleYears) : null;
  const ceReminderStart = renewalDate ? addDays(renewalDate, -90) : null;
  const stateGuideHref = stateCode ? `/state-requirements/${stateCode.toLowerCase()}` : "/state-requirements";
  const trialHref = stateCode ? `/start-trial?state=${encodeURIComponent(stateCode)}` : "/start-trial";
  const shareHref =
    typeof window !== "undefined"
      ? `${window.location.origin}/ai-tracker?state=${encodeURIComponent(stateCode)}&examDate=${encodeURIComponent(examDate)}`
      : "";

  const handleCalendarDownload = () => {
    if (!parsedExamDate || !passConfirmation || !ceReminderStart || !renewalDate) {
      return;
    }

    const trackerStateName = selectedRequirement?.stateName ?? "your state";
    const calendarEntries = [
      {
        date: parsedExamDate,
        title: "Agents of Change exam-day check-in",
        description: `Check in after your exam and confirm next steps for ${trackerStateName}.`,
      },
      {
        date: passConfirmation,
        title: "Agents of Change licensure transition",
        description: `Confirm your result and activate your ${trackerStateName} CE plan.`,
      },
      {
        date: ceReminderStart,
        title: "Agents of Change CE reminder start",
        description: `Begin your CE reminder window with ${ceHoursRequired} hours remaining before renewal.`,
      },
      {
        date: renewalDate,
        title: "Agents of Change renewal milestone",
        description: `Target renewal date for your ${trackerStateName} license cycle.`,
      },
    ];

    const nowUtc = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Agents of Change//AI Tracker//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...calendarEntries.flatMap((entry, index) => [
        "BEGIN:VEVENT",
        `UID:${stateCode || "aoc"}-${formatIcsDate(entry.date)}-${index}@agentsofchange`,
        `DTSTAMP:${nowUtc}`,
        `DTSTART;VALUE=DATE:${formatIcsDate(entry.date)}`,
        `DTEND;VALUE=DATE:${formatIcsDate(addDays(entry.date, 1))}`,
        `SUMMARY:${escapeIcsText(entry.title)}`,
        `DESCRIPTION:${escapeIcsText(entry.description)}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ].join("\r\n");

    downloadIcsFile(`agents-of-change-tracker-${stateCode.toLowerCase() || "timeline"}.ics`, content);
  };

  const handleShareLink = async () => {
    if (!shareHref) {
      setShareStatus("failed");
      return;
    }

    const copied = await copyTextToClipboard(shareHref);
    setShareStatus(copied ? "copied" : "failed");
  };

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
                setShareStatus("idle");
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
                setShareStatus("idle");
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

          <p className="tracker-state-note">
            Shareable setup links are created after you build the timeline.
          </p>
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

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button type="button" className="button primary" onClick={handleCalendarDownload}>
              Download calendar (.ics)
            </button>
            <button type="button" className="button secondary" onClick={handleShareLink}>
              Copy share link
            </button>
            <a className="button secondary" href={stateGuideHref}>
              Open {selectedRequirement?.stateName ?? "state"} requirements
            </a>
            <a className="button secondary" href={trialHref}>
              Start trial with state prefilled
            </a>
          </div>

          {shareStatus === "copied" && (
            <p className="tracker-state-note" aria-live="polite">
              Share link copied to your clipboard.
            </p>
          )}

          {shareStatus === "failed" && (
            <p className="field-error" role="alert">
              We could not copy the share link automatically. You can use the current page URL instead.
            </p>
          )}

          <button type="button" className="button secondary block" onClick={resetForm}>
            Reset tracker
          </button>
        </div>
      )}
    </div>
  );
}
