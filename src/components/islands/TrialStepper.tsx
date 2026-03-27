import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import type { TrialLeadInput } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { US_STATES } from "@/lib/states";

interface TrialErrors {
  [key: string]: string;
}

const stepTitles = ["Identity", "Exam Context", "Consent and Timeline"];
const trialDraftStorageKey = "aoc:trial-stepper-draft:v1";
const examTrackOptions = ["LSW", "LMSW", "LCSW"] as const;
const targetExamWindowOptions = ["0-30", "31-60", "61-90", "90+"] as const;
const studyTimelineOptions = ["immediate", "this_month", "next_quarter"] as const;
const validStateCodes = new Set(US_STATES.map((entry) => entry.code));

type TrialDraft = {
  step: number;
  firstName: string;
  lastName: string;
  email: string;
  examTrack: "LSW" | "LMSW" | "LCSW";
  state: string;
  targetExamWindow: "0-30" | "31-60" | "61-90" | "90+";
  studyTimeline: "immediate" | "this_month" | "next_quarter";
  consentToEmail: boolean;
};

function collectUtm(): Record<string, string | undefined> {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
    term: params.get("utm_term") || undefined,
    content: params.get("utm_content") || undefined,
  };
}

function isExamTrack(value: string | null): value is "LSW" | "LMSW" | "LCSW" {
  return Boolean(value && examTrackOptions.includes(value as (typeof examTrackOptions)[number]));
}

function isTargetExamWindow(value: string | null): value is "0-30" | "31-60" | "61-90" | "90+" {
  return Boolean(value && targetExamWindowOptions.includes(value as (typeof targetExamWindowOptions)[number]));
}

function isStudyTimeline(value: string | null): value is "immediate" | "this_month" | "next_quarter" {
  return Boolean(value && studyTimelineOptions.includes(value as (typeof studyTimelineOptions)[number]));
}

function normalizeStateCode(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  return validStateCodes.has(normalized) ? normalized : undefined;
}

function getDraftFromSessionStorage(): Partial<TrialDraft> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(trialDraftStorageKey);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<TrialDraft>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      step:
        typeof parsed.step === "number" && parsed.step >= 0 && parsed.step < stepTitles.length
          ? parsed.step
          : undefined,
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : undefined,
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : undefined,
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      examTrack: isExamTrack(parsed.examTrack ?? null) ? parsed.examTrack : undefined,
      state: normalizeStateCode(parsed.state ?? null),
      targetExamWindow: isTargetExamWindow(parsed.targetExamWindow ?? null) ? parsed.targetExamWindow : undefined,
      studyTimeline: isStudyTimeline(parsed.studyTimeline ?? null) ? parsed.studyTimeline : undefined,
      consentToEmail: typeof parsed.consentToEmail === "boolean" ? parsed.consentToEmail : undefined,
    };
  } catch {
    return null;
  }
}

function getPrefillsFromSearch(): Partial<TrialDraft> {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const stepParam = params.get("step");
  const parsedStep = stepParam ? Number.parseInt(stepParam, 10) : Number.NaN;
  const examTrack = params.get("examTrack");
  const targetExamWindow = params.get("targetExamWindow");
  const studyTimeline = params.get("studyTimeline");

  return {
    step:
      Number.isInteger(parsedStep) && parsedStep >= 1 && parsedStep <= stepTitles.length
        ? parsedStep - 1
        : undefined,
    examTrack: isExamTrack(examTrack) ? examTrack : undefined,
    state: normalizeStateCode(params.get("state")),
    targetExamWindow: isTargetExamWindow(targetExamWindow) ? targetExamWindow : undefined,
    studyTimeline: isStudyTimeline(studyTimeline) ? studyTimeline : undefined,
  };
}

function mapSubmitError(errorCode?: string): string {
  switch (errorCode) {
    case "VALIDATION_ERROR":
      return "Please review your details and try again.";
    case "RATE_LIMITED":
      return "Too many attempts were submitted. Please wait about a minute and try again.";
    case "HUBSPOT_ERROR":
      return "Our enrollment system is temporarily unavailable. Please try again shortly.";
    default:
      return "We couldn't process your request right now. Please try again in a moment.";
  }
}

export default function TrialStepper() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [hasInitializedDraft, setHasInitializedDraft] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [examTrack, setExamTrack] = useState<"LSW" | "LMSW" | "LCSW">("LMSW");
  const [state, setState] = useState("CA");
  const [targetExamWindow, setTargetExamWindow] = useState<"0-30" | "31-60" | "61-90" | "90+">("61-90");

  const [studyTimeline, setStudyTimeline] = useState<"immediate" | "this_month" | "next_quarter">("this_month");
  const [consentToEmail, setConsentToEmail] = useState(false);

  const [errors, setErrors] = useState<TrialErrors>({});

  useEffect(() => {
    trackEvent("trial_step_view", {
      step_number: step + 1,
      step_name: stepTitles[step],
    });
  }, [step]);

  useEffect(() => {
    const storedDraft = getDraftFromSessionStorage();
    const queryPrefills = getPrefillsFromSearch();

    if (storedDraft) {
      setFirstName(storedDraft.firstName ?? "");
      setLastName(storedDraft.lastName ?? "");
      setEmail(storedDraft.email ?? "");
      setExamTrack(storedDraft.examTrack ?? "LMSW");
      setState(storedDraft.state ?? "CA");
      setTargetExamWindow(storedDraft.targetExamWindow ?? "61-90");
      setStudyTimeline(storedDraft.studyTimeline ?? "this_month");
      setConsentToEmail(storedDraft.consentToEmail ?? false);
      setStep(storedDraft.step ?? 0);
      setRestoredDraft(true);
    }

    if (queryPrefills.examTrack) {
      setExamTrack(queryPrefills.examTrack);
    }
    if (queryPrefills.state) {
      setState(queryPrefills.state);
    }
    if (queryPrefills.targetExamWindow) {
      setTargetExamWindow(queryPrefills.targetExamWindow);
    }
    if (queryPrefills.studyTimeline) {
      setStudyTimeline(queryPrefills.studyTimeline);
    }
    if (typeof queryPrefills.step === "number") {
      setStep(queryPrefills.step);
    }

    setHasInitializedDraft(true);
  }, []);

  useEffect(() => {
    if (!hasInitializedDraft || typeof window === "undefined") {
      return;
    }

    const nextDraft: TrialDraft = {
      step,
      firstName,
      lastName,
      email,
      examTrack,
      state,
      targetExamWindow,
      studyTimeline,
      consentToEmail,
    };

    window.sessionStorage.setItem(trialDraftStorageKey, JSON.stringify(nextDraft));
  }, [consentToEmail, email, examTrack, firstName, hasInitializedDraft, lastName, state, step, studyTimeline, targetExamWindow]);

  const progress = useMemo(() => ((step + 1) / stepTitles.length) * 100, [step]);

  function validate(currentStep: number): TrialErrors {
    const nextErrors: TrialErrors = {};

    if (currentStep === 0) {
      if (!firstName.trim()) {
        nextErrors.firstName = "First name is required.";
      }
      if (!lastName.trim()) {
        nextErrors.lastName = "Last name is required.";
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "A valid email is required.";
      }
    }

    if (currentStep === 1) {
      if (!state) {
        nextErrors.state = "Please select your state.";
      }
      if (!examTrack) {
        nextErrors.examTrack = "Please select an exam track.";
      }
    }

    if (currentStep === 2) {
      if (!consentToEmail) {
        nextErrors.consentToEmail = "You need to agree to receive trial resources by email.";
      }
    }

    return nextErrors;
  }

  function validateAllSteps(): { errors: TrialErrors; firstInvalidStep: number | null } {
    const combinedErrors: TrialErrors = {};
    let firstInvalidStep: number | null = null;

    for (let currentStep = 0; currentStep < stepTitles.length; currentStep += 1) {
      const stepErrors = validate(currentStep);
      if (Object.keys(stepErrors).length > 0 && firstInvalidStep === null) {
        firstInvalidStep = currentStep;
      }

      Object.assign(combinedErrors, stepErrors);
    }

    return { errors: combinedErrors, firstInvalidStep };
  }

  function clearFieldError(field: keyof TrialErrors) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function completeCurrentStep(): boolean {
    const nextErrors = validate(step);
    setErrors(nextErrors);
    setGlobalError(null);

    if (Object.keys(nextErrors).length > 0) {
      trackEvent("form_validation_error", {
        step_number: step + 1,
        fields: Object.keys(nextErrors).join(","),
      });
      return false;
    }

    trackEvent("trial_step_complete", {
      step_number: step + 1,
      step_name: stepTitles[step],
    });

    setStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
    return true;
  }

  function handleNext() {
    completeCurrentStep();
  }

  function handlePrevious() {
    setErrors({});
    setGlobalError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < stepTitles.length - 1) {
      completeCurrentStep();
      return;
    }

    const { errors: nextErrors, firstInvalidStep } = validateAllSteps();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      trackEvent("form_validation_error", {
        step_number: step + 1,
        fields: Object.keys(nextErrors).join(","),
      });
      if (typeof firstInvalidStep === "number") {
        setStep(firstInvalidStep);
      }
      return;
    }

    const sourcePage =
      typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/start-trial";

    const payload: TrialLeadInput = {
      firstName,
      lastName,
      email,
      examTrack,
      state,
      targetExamWindow,
      studyTimeline,
      consentToEmail,
      sourcePage: sourcePage.slice(0, 2048),
      utm: collectUtm(),
    };

    setSubmitting(true);
    setGlobalError(null);

    trackEvent("trial_step_complete", {
      step_number: step + 1,
      step_name: stepTitles[step],
    });

    trackEvent("trial_submit", {
      exam_track: examTrack,
      state,
      target_exam_window: targetExamWindow,
      study_timeline: studyTimeline,
    });

    try {
      const response = await fetch("/api/trial-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { success: boolean; leadId?: string; errorCode?: string };

      if (!response.ok || !result.success) {
        trackEvent("trial_submit_error", {
          error_code: result.errorCode || "UNKNOWN",
        });
        setGlobalError(mapSubmitError(result.errorCode));
        setSubmitting(false);
        return;
      }

      trackEvent("trial_submit_success", {
        lead_id: result.leadId || "unknown",
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(trialDraftStorageKey);
      }

      const destination = result.leadId
        ? `/trial/thanks?lead=${encodeURIComponent(result.leadId)}`
        : "/trial/thanks";

      window.location.assign(destination);
    } catch {
      trackEvent("trial_submit_error", {
        error_code: "NETWORK",
      });
      setGlobalError("Connection issue detected. Please retry.");
      setSubmitting(false);
    }
  }

  return (
    <form className="trial-form" onSubmit={handleSubmit} noValidate>
      {restoredDraft && (
        <p aria-live="polite">
          Your saved trial draft has been restored for this browser session.
        </p>
      )}

      <div className="step-progress" aria-hidden="true">
        <div style={{ width: `${progress}%` }}></div>
      </div>

      <ol className="stepper" aria-label="Trial form progress">
        {stepTitles.map((title, index) => (
          <li key={title} aria-current={index === step ? "step" : undefined} className={index <= step ? "active" : ""}>
            <span>{index + 1}</span>
            <p>{title}</p>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset>
          <legend>Tell us who you are</legend>

          <label>
            First name
            <input
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                clearFieldError("firstName");
                setGlobalError(null);
              }}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? "error-first-name" : undefined}
            />
            {errors.firstName && <span id="error-first-name" className="field-error">{errors.firstName}</span>}
          </label>

          <label>
            Last name
            <input
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value);
                clearFieldError("lastName");
                setGlobalError(null);
              }}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "error-last-name" : undefined}
            />
            {errors.lastName && <span id="error-last-name" className="field-error">{errors.lastName}</span>}
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
                setGlobalError(null);
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "error-email" : undefined}
            />
            {errors.email && <span id="error-email" className="field-error">{errors.email}</span>}
          </label>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset>
          <legend>Exam context</legend>

          <label>
            Which exam are you preparing for?
            <select
              value={examTrack}
              onChange={(event) => {
                setExamTrack(event.target.value as "LSW" | "LMSW" | "LCSW");
                clearFieldError("examTrack");
                setGlobalError(null);
              }}
            >
              <option value="LSW">LSW</option>
              <option value="LMSW">LMSW</option>
              <option value="LCSW">LCSW</option>
            </select>
          </label>

          <label>
            Which state are you testing in?
            <select
              value={state}
              onChange={(event) => {
                setState(event.target.value);
                clearFieldError("state");
                setGlobalError(null);
              }}
              aria-invalid={Boolean(errors.state)}
            >
              {US_STATES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.name}
                </option>
              ))}
            </select>
            {errors.state && <span className="field-error">{errors.state}</span>}
          </label>

          <label>
            Target exam window
            <select
              value={targetExamWindow}
              onChange={(event) => {
                setTargetExamWindow(event.target.value as "0-30" | "31-60" | "61-90" | "90+");
                setGlobalError(null);
              }}
            >
              <option value="0-30">0-30 days</option>
              <option value="31-60">31-60 days</option>
              <option value="61-90">61-90 days</option>
              <option value="90+">90+ days</option>
            </select>
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend>Consent and study intent</legend>

          <label>
            Study timeline
            <select
              value={studyTimeline}
              onChange={(event) => {
                setStudyTimeline(event.target.value as "immediate" | "this_month" | "next_quarter");
                setGlobalError(null);
              }}
            >
              <option value="immediate">I want to start today</option>
              <option value="this_month">I can start this month</option>
              <option value="next_quarter">I am planning for next quarter</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={consentToEmail}
              onChange={(event) => {
                setConsentToEmail(event.target.checked);
                clearFieldError("consentToEmail");
                setGlobalError(null);
              }}
              aria-invalid={Boolean(errors.consentToEmail)}
            />
            <span>I agree to receive trial materials and exam prep support by email.</span>
          </label>
          {errors.consentToEmail && <span className="field-error">{errors.consentToEmail}</span>}
        </fieldset>
      )}

      {globalError && (
        <p className="form-alert" role="alert" aria-live="assertive">
          {globalError}
        </p>
      )}

      <div className="trial-actions">
        <button type="button" className="button secondary" onClick={handlePrevious} disabled={step === 0 || submitting}>
          Back
        </button>

        {step < stepTitles.length - 1 ? (
          <button type="button" className="button primary" onClick={handleNext} disabled={submitting}>
            Continue
          </button>
        ) : (
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Start Free Trial"}
          </button>
        )}
      </div>
    </form>
  );
}
