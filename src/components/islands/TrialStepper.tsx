import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import type { TrialLeadInput } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { US_STATES } from "@/lib/states";

interface TrialErrors {
  [key: string]: string;
}

const stepTitles = ["Identity", "Exam Context", "Consent and Timeline"];

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

export default function TrialStepper() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

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

  function handleNext() {
    const nextErrors = validate(step);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      trackEvent("form_validation_error", {
        step_number: step + 1,
        fields: Object.keys(nextErrors).join(","),
      });
      return;
    }

    trackEvent("trial_step_complete", {
      step_number: step + 1,
      step_name: stepTitles[step],
    });

    setStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
  }

  function handlePrevious() {
    setErrors({});
    setGlobalError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(step);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      trackEvent("form_validation_error", {
        step_number: step + 1,
        fields: Object.keys(nextErrors).join(","),
      });
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
        setGlobalError("We couldn't process your request right now. Please try again in a moment.");
        setSubmitting(false);
        return;
      }

      trackEvent("trial_submit_success", {
        lead_id: result.leadId || "unknown",
      });

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
              onChange={(event) => setFirstName(event.target.value)}
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
              onChange={(event) => setLastName(event.target.value)}
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
              onChange={(event) => setEmail(event.target.value)}
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
            <select value={examTrack} onChange={(event) => setExamTrack(event.target.value as "LSW" | "LMSW" | "LCSW")}>
              <option value="LSW">LSW</option>
              <option value="LMSW">LMSW</option>
              <option value="LCSW">LCSW</option>
            </select>
          </label>

          <label>
            Which state are you testing in?
            <select value={state} onChange={(event) => setState(event.target.value)} aria-invalid={Boolean(errors.state)}>
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
              onChange={(event) => setTargetExamWindow(event.target.value as "0-30" | "31-60" | "61-90" | "90+")}
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
              onChange={(event) => setStudyTimeline(event.target.value as "immediate" | "this_month" | "next_quarter")}
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
              onChange={(event) => setConsentToEmail(event.target.checked)}
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
