import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { stateCodeToName } from "@/lib/states";
import type { ExamTrack } from "@/lib/types";

interface CommunityGroup {
  city: string;
  stateCode: string;
  members: number;
  label: string;
}

interface CommunityForum {
  topic: string;
  threads: number;
  icon: string;
}

interface CommunityJob {
  title: string;
  company: string;
  location: string;
  stateCode: string;
  type: string;
}

interface CommunityHubExplorerProps {
  groups: CommunityGroup[];
  forums: CommunityForum[];
  jobs: CommunityJob[];
}

type ViewMode = "all" | "groups" | "forums" | "jobs";

const SUPPORT_EMAIL = "support@agentsofchangeprep.com";
const viewOptions: Array<{ value: ViewMode; label: string }> = [
  { value: "all", label: "All sections" },
  { value: "groups", label: "Study groups" },
  { value: "forums", label: "Specialty forums" },
  { value: "jobs", label: "Job board" },
];

function normalizeView(value: string | null): ViewMode {
  return viewOptions.some((option) => option.value === value) ? (value as ViewMode) : "all";
}

function inferExamTrack(value: string): ExamTrack | undefined {
  const normalized = value.toUpperCase();

  if (normalized.includes("BSW")) {
    return "BSW";
  }

  if (normalized.includes("LCSW")) {
    return "LCSW";
  }

  if (normalized.includes("LMSW")) {
    return "LMSW";
  }

  if (normalized.includes("LSW")) {
    return "LSW";
  }

  return undefined;
}

function buildTrialHref(examTrack?: ExamTrack, stateCode?: string): string {
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

  const queryString = params.toString();
  return queryString ? `/start-trial?${queryString}` : "/start-trial";
}

function buildStateGuideHref(stateCode: string): string {
  return `/state-requirements/${stateCode.toLowerCase()}`;
}

function buildResourceHref(topic: string): string {
  const params = new URLSearchParams({ q: topic });
  return `/resources?${params.toString()}`;
}

function buildContactHref(topic: "enrollment" | "licensing", examTrack?: ExamTrack, stateCode?: string): string {
  const params = new URLSearchParams({ topic });

  if (examTrack) {
    params.set("examTrack", examTrack);
  }

  if (stateCode) {
    params.set("state", stateCode);
  }

  return `/contact?${params.toString()}`;
}

function buildGroupJoinHref(group: CommunityGroup): string {
  const subject = `Join ${group.city} ${group.label}`;
  const body = [
    "Hello Agents of Change team,",
    "",
    `I want to join "${group.label}" in ${group.city}, ${group.stateCode}.`,
    `Please send me the next steps or access details.`,
    "",
    "Thank you.",
  ];

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join("\n"))}`;
}

function buildJobBoardHref(jobTitle?: string): string {
  const subject = jobTitle ? `Job Board Access - ${jobTitle}` : "Job Board Access";
  const body = [
    "Hello Agents of Change team,",
    "",
    "I would like access to the broader job board or help identifying the right role.",
    jobTitle ? `Current role of interest: ${jobTitle}` : "Current role of interest:",
    "",
    "Thank you.",
  ];

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join("\n"))}`;
}

function buildGroupSearchDocument(group: CommunityGroup): string {
  return [group.city, group.stateCode, stateCodeToName(group.stateCode), group.label, group.members.toString()]
    .join(" ")
    .toLowerCase();
}

function buildForumSearchDocument(forum: CommunityForum): string {
  return [forum.topic, forum.threads.toString()].join(" ").toLowerCase();
}

function buildJobSearchDocument(job: CommunityJob): string {
  return [job.title, job.company, job.location, job.type, job.stateCode, stateCodeToName(job.stateCode)]
    .join(" ")
    .toLowerCase();
}

export default function CommunityHubExplorer({ groups, forums, jobs }: CommunityHubExplorerProps) {
  const stateOptions = useMemo(
    () =>
      Array.from(new Set([...groups.map((group) => group.stateCode), ...jobs.map((job) => job.stateCode)]))
        .sort((left, right) => stateCodeToName(left).localeCompare(stateCodeToName(right)))
        .map((code) => ({ code, name: stateCodeToName(code) })),
    [groups, jobs],
  );

  const jobTypeOptions = useMemo(
    () => ["all", ...new Set(jobs.map((job) => job.type).sort((left, right) => left.localeCompare(right)))],
    [jobs],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [stateCode, setStateCode] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextQuery = params.get("q");
    const nextView = normalizeView(params.get("view"));
    const nextState = params.get("state");
    const nextJobType = params.get("jobType");

    if (nextQuery) {
      setSearchQuery(nextQuery);
    }

    setViewMode(nextView);

    if (nextState && (nextState === "all" || stateOptions.some((option) => option.code === nextState))) {
      setStateCode(nextState);
    }

    if (nextJobType && jobTypeOptions.includes(nextJobType)) {
      setJobType(nextJobType);
    }

    setHasInitialized(true);
  }, [jobTypeOptions, stateOptions]);

  useEffect(() => {
    if (!hasInitialized || typeof window === "undefined") {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (searchQuery.trim()) {
      nextUrl.searchParams.set("q", searchQuery.trim());
    } else {
      nextUrl.searchParams.delete("q");
    }

    if (viewMode !== "all") {
      nextUrl.searchParams.set("view", viewMode);
    } else {
      nextUrl.searchParams.delete("view");
    }

    if (stateCode !== "all") {
      nextUrl.searchParams.set("state", stateCode);
    } else {
      nextUrl.searchParams.delete("state");
    }

    if (jobType !== "all") {
      nextUrl.searchParams.set("jobType", jobType);
    } else {
      nextUrl.searchParams.delete("jobType");
    }

    window.history.replaceState({}, "", nextUrl);
  }, [hasInitialized, jobType, searchQuery, stateCode, viewMode]);

  function logFilter(type: string, value: string) {
    trackEvent("filter_interaction", {
      filter_type: type,
      filter_value: value,
      module: "community-hub",
    });
  }

  const filteredGroups = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesState = stateCode === "all" || group.stateCode === stateCode;
      const matchesSearch = !normalizedQuery || buildGroupSearchDocument(group).includes(normalizedQuery);
      return matchesState && matchesSearch;
    });
  }, [groups, searchQuery, stateCode]);

  const filteredForums = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return forums.filter((forum) => !normalizedQuery || buildForumSearchDocument(forum).includes(normalizedQuery));
  }, [forums, searchQuery]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesState = stateCode === "all" || job.stateCode === stateCode;
      const matchesJobType = jobType === "all" || job.type === jobType;
      const matchesSearch = !normalizedQuery || buildJobSearchDocument(job).includes(normalizedQuery);
      return matchesState && matchesJobType && matchesSearch;
    });
  }, [jobType, jobs, searchQuery, stateCode]);

  const activeCount = useMemo(() => {
    if (viewMode === "groups") {
      return filteredGroups.length;
    }

    if (viewMode === "forums") {
      return filteredForums.length;
    }

    if (viewMode === "jobs") {
      return filteredJobs.length;
    }

    return filteredGroups.length + filteredForums.length + filteredJobs.length;
  }, [filteredForums.length, filteredGroups.length, filteredJobs.length, viewMode]);

  const hasActiveFilters = searchQuery.trim().length > 0 || viewMode !== "all" || stateCode !== "all" || jobType !== "all";

  const fallbackStateCode = filteredGroups[0]?.stateCode ?? filteredJobs[0]?.stateCode;
  const recommendedExamTrack = inferExamTrack(filteredGroups[0]?.label ?? filteredJobs[0]?.title ?? "");

  const recommendation = useMemo(() => {
    if (!hasActiveFilters) {
      return {
        title: "Choose the community view that fits where you are right now",
        description: "Use groups for accountability, forums for specialty learning, and jobs for role-specific licensing context without guessing where to start.",
        href: "/start-trial?step=2",
        label: "Start a study plan",
        secondaryHref: buildContactHref("enrollment"),
        secondaryLabel: "Contact support",
      };
    }

    if (viewMode === "forums") {
      const forum = filteredForums[0];

      return {
        title: "Turn a specialty interest into a practical next step",
        description: "Use forums to jump into matching articles, tactics, and practice guidance instead of starting from a blank page.",
        href: forum ? buildResourceHref(forum.topic) : "/resources",
        label: forum ? `Open resources for ${forum.topic}` : "Browse resources",
        secondaryHref: buildContactHref("enrollment", recommendedExamTrack, fallbackStateCode),
        secondaryLabel: "Contact support",
      };
    }

    if (viewMode === "jobs" || jobType !== "all") {
      return {
        title: "Check the licensing path behind the role before you commit",
        description: "Use state requirements to confirm the local licensing picture, then route any gaps to support before you apply or relocate.",
        href: fallbackStateCode ? buildStateGuideHref(fallbackStateCode) : "/state-requirements",
        label: fallbackStateCode ? `Open ${stateCodeToName(fallbackStateCode)} requirements` : "Browse state requirements",
        secondaryHref: buildContactHref("licensing", recommendedExamTrack, fallbackStateCode),
        secondaryLabel: "Ask for licensing guidance",
      };
    }

    return {
      title: "Use community intent to build a concrete study plan",
      description: "If a city, role, or group catches your eye, carry that context straight into the trial flow instead of restarting later.",
      href: buildTrialHref(recommendedExamTrack, fallbackStateCode),
      label: recommendedExamTrack
        ? fallbackStateCode
          ? `Start a ${recommendedExamTrack} plan for ${stateCodeToName(fallbackStateCode)}`
          : `Start a ${recommendedExamTrack} study plan`
        : fallbackStateCode
          ? `Start a study plan for ${stateCodeToName(fallbackStateCode)}`
          : "Start a study plan",
      secondaryHref: buildContactHref("enrollment", recommendedExamTrack, fallbackStateCode),
      secondaryLabel: "Route me to the right path",
    };
  }, [fallbackStateCode, filteredForums, hasActiveFilters, jobType, recommendedExamTrack, viewMode]);

  function resetFilters() {
    setSearchQuery("");
    setViewMode("all");
    setStateCode("all");
    setJobType("all");
    logFilter("reset", "all");
  }

  const showGroups = viewMode === "groups" || (viewMode === "all" && filteredGroups.length > 0);
  const showForums = viewMode === "forums" || (viewMode === "all" && filteredForums.length > 0);
  const showJobs = viewMode === "jobs" || (viewMode === "all" && filteredJobs.length > 0);

  return (
    <div className="testimonial-filter-layout">
      <form className="filter-bar community-filter-bar" aria-label="Filter community pathways" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Search</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Try Chicago, school social work, LCSW..."
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <label>
          <span>Focus area</span>
          <select
            value={viewMode}
            onChange={(event) => {
              const nextValue = event.target.value as ViewMode;
              setViewMode(nextValue);
              logFilter("view", nextValue);
            }}
          >
            {viewOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>State</span>
          <select
            value={stateCode}
            onChange={(event) => {
              setStateCode(event.target.value);
              logFilter("state", event.target.value);
            }}
          >
            <option value="all">All states</option>
            {stateOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Job type</span>
          <select
            value={jobType}
            onChange={(event) => {
              setJobType(event.target.value);
              logFilter("job_type", event.target.value);
            }}
          >
            {jobTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All job types" : option}
              </option>
            ))}
          </select>
        </label>
      </form>

      {hasActiveFilters && (
        <div>
          <button type="button" className="button secondary" onClick={resetFilters}>
            Clear community filters
          </button>
        </div>
      )}

      <p className="result-meta" aria-live="polite">
        {viewMode === "all"
          ? `${filteredGroups.length} groups, ${filteredForums.length} forums, and ${filteredJobs.length} jobs shown`
          : `${activeCount} ${viewMode} shown`}
      </p>

      <article className="support-card community-recommendation-card">
        <h3>{recommendation.title}</h3>
        <p>{recommendation.description}</p>
        <div className="community-actions">
          <a href={recommendation.href} className="button secondary" data-cta="community-next-step" data-cta-location={viewMode}>
            {recommendation.label}
          </a>
          <a href={recommendation.secondaryHref} className="button secondary" data-cta="community-support-path" data-cta-location={viewMode}>
            {recommendation.secondaryLabel}
          </a>
        </div>
      </article>

      {activeCount === 0 ? (
        <article className="support-card community-empty-state">
          <h3>No community matches found</h3>
          <p>Try a broader search, remove the job-type filter, or let support route you to the right next step.</p>
          <div className="community-actions">
            <button type="button" className="button secondary" onClick={resetFilters}>
              Reset filters
            </button>
            <a
              href={buildContactHref("enrollment", recommendedExamTrack, stateCode !== "all" ? stateCode : undefined)}
              className="button secondary"
            >
              Contact support
            </a>
          </div>
        </article>
      ) : (
        <div className="community-results-stack">
          {showGroups && (
            <section className="community-block" aria-labelledby="community-groups-title">
              <div className="community-block-header">
                <div>
                  <h3 id="community-groups-title">Local study groups</h3>
                  <p>Join a regional cohort and carry the matching state and exam context into your next step.</p>
                </div>
                <p className="community-count">{filteredGroups.length} shown</p>
              </div>

              {filteredGroups.length === 0 ? (
                <article className="support-card community-empty-state">
                  <p>No local groups match the current filters.</p>
                </article>
              ) : (
                <div className="community-card-grid">
                  {filteredGroups.map((group) => {
                    const examTrack = inferExamTrack(group.label);

                    return (
                      <article className="support-card community-data-card" key={`${group.city}-${group.label}`}>
                        <div>
                          <h3>{group.city}, {group.stateCode}</h3>
                          <p>{group.label}</p>
                        </div>
                        <div className="community-meta-row">
                          <span className="community-pill">{examTrack}</span>
                          <span>{group.members.toLocaleString()}+ active members</span>
                        </div>
                        <div className="community-actions">
                          <a href={buildGroupJoinHref(group)} className="button secondary">
                            Join interest list
                          </a>
                          <a href={buildTrialHref(examTrack, group.stateCode)} className="button secondary">
                            Start matching plan
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {showForums && (
            <section className="community-block" aria-labelledby="community-forums-title">
              <div className="community-block-header">
                <div>
                  <h3 id="community-forums-title">Specialty forums</h3>
                  <p>Use specialty interest to jump into the closest set of resources instead of browsing from scratch.</p>
                </div>
                <p className="community-count">{filteredForums.length} shown</p>
              </div>

              {filteredForums.length === 0 ? (
                <article className="support-card community-empty-state">
                  <p>No specialty forums match the current search.</p>
                </article>
              ) : (
                <div className="community-card-grid">
                  {filteredForums.map((forum) => (
                    <article className="support-card community-data-card" key={forum.topic}>
                      <div className="community-meta-row">
                        <span className="community-icon" aria-hidden="true">{forum.icon}</span>
                        <span>{forum.threads} active threads</span>
                      </div>
                      <div>
                        <h3>{forum.topic}</h3>
                        <p>Open resources, tactics, and guidance that map to this specialty area.</p>
                      </div>
                      <div className="community-actions">
                        <a href={buildResourceHref(forum.topic)} className="button secondary">
                          Open related resources
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {showJobs && (
            <section className="community-block" aria-labelledby="community-jobs-title">
              <div className="community-block-header">
                <div>
                  <h3 id="community-jobs-title">Job board</h3>
                  <p>Check the licensing and prep context around a role before you move into application mode.</p>
                </div>
                <p className="community-count">{filteredJobs.length} shown</p>
              </div>

              {filteredJobs.length === 0 ? (
                <article className="support-card community-empty-state">
                  <p>No jobs match the current filters.</p>
                </article>
              ) : (
                <div className="community-card-grid">
                  {filteredJobs.map((job) => {
                    const examTrack = inferExamTrack(job.title);

                    return (
                      <article className="support-card community-data-card" key={`${job.title}-${job.company}-${job.location}`}>
                        <div>
                          <h3>{job.title}</h3>
                          <p>{job.company}</p>
                        </div>
                        <div className="community-meta-row">
                          <span>{job.location}</span>
                          <span className="community-pill">{job.type}</span>
                        </div>
                        <div className="community-actions">
                          <a href={buildStateGuideHref(job.stateCode)} className="button secondary">
                            Check state guide
                          </a>
                          <a href={buildTrialHref(examTrack, job.stateCode)} className="button secondary">
                            Match prep to role
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="community-job-footer">
                <a href={buildJobBoardHref()} className="button secondary">
                  Request full job board access
                </a>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
