import { useEffect, useMemo, useState } from "react";
import { US_STATES, stateCodeToName } from "@/lib/states";
import type { ContactPathway, ExamTrack } from "@/lib/types";

interface SupportRouterProps {
  pathways: ContactPathway[];
}

type SupportExamTrack = "" | ExamTrack;

const examTrackOptions: ExamTrack[] = ["BSW", "LSW", "LMSW", "LCSW"];
const validStateCodes = new Set(US_STATES.map((entry) => entry.code));

function normalizeStateCode(value: string | null): string {
  if (!value) {
    return "";
  }

  const normalized = value.trim().toUpperCase();
  return validStateCodes.has(normalized) ? normalized : "";
}

function normalizeExamTrack(value: string | null): SupportExamTrack {
  return examTrackOptions.includes(value as ExamTrack) ? (value as ExamTrack) : "";
}

function buildRecommendedStep(topic: string, examTrack: SupportExamTrack, stateCode: string): { href: string; label: string } {
  if (topic === "licensing") {
    return {
      href: stateCode ? `/state-requirements/${stateCode.toLowerCase()}` : "/state-requirements",
      label: stateCode ? `Open ${stateCodeToName(stateCode)} requirements` : "Browse state requirements",
    };
  }

  if (topic === "ce") {
    return {
      href: "/continuing-education#ce-catalog",
      label: "Open CE catalog",
    };
  }

  const params = new URLSearchParams();

  if (examTrack) {
    params.set("examTrack", examTrack);
  }

  if (stateCode) {
    params.set("state", stateCode);
  }

  if (examTrack || stateCode) {
    params.set("step", "2");
  }

  const query = params.toString();

  return {
    href: query ? `/start-trial?${query}` : "/start-trial",
    label: "Start my personalized trial",
  };
}

export default function SupportRouter({ pathways }: SupportRouterProps) {
  const defaultTopic = pathways[0]?.id ?? "enrollment";
  const defaultExamTrack: SupportExamTrack = "";

  const [topic, setTopic] = useState(defaultTopic);
  const [examTrack, setExamTrack] = useState<SupportExamTrack>(defaultExamTrack);
  const [stateCode, setStateCode] = useState("");
  const [summary, setSummary] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextTopic = params.get("topic");
    const nextExamTrack = params.get("examTrack");
    const nextStateCode = params.get("state");

    if (nextTopic && pathways.some((pathway) => pathway.id === nextTopic)) {
      setTopic(nextTopic);
    }

    setExamTrack(normalizeExamTrack(nextExamTrack));
    setStateCode(normalizeStateCode(nextStateCode));

    setHasInitialized(true);
  }, [pathways]);

  useEffect(() => {
    if (!hasInitialized || typeof window === "undefined") {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (topic !== defaultTopic) {
      nextUrl.searchParams.set("topic", topic);
    } else {
      nextUrl.searchParams.delete("topic");
    }

    if (examTrack !== defaultExamTrack) {
      nextUrl.searchParams.set("examTrack", examTrack);
    } else {
      nextUrl.searchParams.delete("examTrack");
    }

    if (stateCode) {
      nextUrl.searchParams.set("state", stateCode);
    } else {
      nextUrl.searchParams.delete("state");
    }

    window.history.replaceState({}, "", nextUrl);
  }, [defaultExamTrack, defaultTopic, examTrack, hasInitialized, stateCode, topic]);

  const selectedPathway = useMemo(
    () => pathways.find((pathway) => pathway.id === topic) ?? pathways[0],
    [pathways, topic],
  );

  const recommendedStep = useMemo(() => buildRecommendedStep(topic, examTrack, stateCode), [examTrack, stateCode, topic]);

  const emailHref = useMemo(() => {
    const subjectBase =
      topic === "licensing"
        ? "Licensing Guidance"
        : topic === "ce"
          ? "CE Support"
          : "Enrollment Support";

    const subject = stateCode ? `${subjectBase} - ${stateCode}` : subjectBase;
    const bodyLines = [
      "Hello Agents of Change team,",
      "",
      `I need help with: ${selectedPathway?.title ?? "Support request"}`,
      `Exam track: ${examTrack || "Not specified"}`,
      `State: ${stateCode || "Not specified"}`,
      "",
      "Summary:",
      summary.trim() || "Please help me identify the right next step.",
      "",
      "Thank you.",
    ];

    return `mailto:support@agentsofchangeprep.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  }, [examTrack, selectedPathway, stateCode, summary, topic]);

  return (
    <div className="testimonial-filter-layout">
      <form className="filter-bar" aria-label="Support request form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Help topic</span>
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            {pathways.map((pathway) => (
              <option key={pathway.id} value={pathway.id}>
                {pathway.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Exam track</span>
          <select value={examTrack} onChange={(event) => setExamTrack(event.target.value as SupportExamTrack)}>
            <option value="">No exam track selected</option>
            {examTrackOptions.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>State</span>
          <select value={stateCode} onChange={(event) => setStateCode(event.target.value)}>
            <option value="">No state selected</option>
            {US_STATES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          <span>Short summary</span>
          <textarea
            rows={4}
            value={summary}
            placeholder="Describe what you need help with so the right team has context."
            onChange={(event) => setSummary(event.target.value)}
          />
        </label>
      </form>

      <article className="support-card">
        <h3>{selectedPathway?.title ?? "Recommended support path"}</h3>
        <p>{selectedPathway?.description}</p>
        {selectedPathway?.responseTime && <p className="support-sla">{selectedPathway.responseTime}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <a href={emailHref} className="button secondary" data-cta="support-router-email" data-cta-location={topic}>
            Open support email
          </a>
          <a href={recommendedStep.href} className="button secondary" data-cta="support-router-next-step" data-cta-location={topic}>
            {recommendedStep.label}
          </a>
        </div>
      </article>
    </div>
  );
}
