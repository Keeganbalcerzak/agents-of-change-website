import type {
  AudiencePathway,
  CECourse,
  CompetencyDomain,
  ContactPathway,
  FaqItem,
  InstructorProfile,
  NavItem,
  OriginTimelineStep,
  ProgramOffer,
  PricingSection,
  ResourceArticle,
  SallyJourneyStep,
  SeoMetadata,
  SiteSettings,
  StoryPairing,
  StateRequirement,
  StatItem,
  StudyPhase,
  CareerPhase,
  Testimonial,
} from "@/lib/types";
import { US_STATES } from "@/lib/states";

export const defaultSiteSettings: SiteSettings = {
  siteName: "Agents of Change",
  tagline: "Social Work Exam Prep and Continuing Education",
  primaryCtaLabel: "Start Free Trial",
  primaryCtaHref: "/start-trial",
  supportEmail: "support@agentsofchangeprep.com",
  supportPhone: "(555) 232-1944",
  aceProviderNumber: "#1919",
};

export const defaultNavItems: NavItem[] = [
  { label: "Why It Works", href: "/#how-it-works" },
  { label: "Exam Prep", href: "/exam-prep" },
  { label: "Continuing Education", href: "/continuing-education" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Community", href: "/community" },
  { label: "Resources", href: "/resources" },
  { label: "State Requirements", href: "/state-requirements" },
  { label: "About", href: "/about" },
  { label: "Start Free Trial", href: "/start-trial", primary: true },
];

export const defaultStats: StatItem[] = [
  { value: "100,000+", label: "Social workers served" },
  { value: "50,000+", label: "Email subscribers" },
  { value: "26,000+", label: "Facebook community members" },
  { value: "181+", label: "Podcast episodes published" },
];

export const defaultProgramOffers: ProgramOffer[] = [
  {
    slug: "basics",
    title: "Basics",
    subtitle: "Core package · Masters or Clinical track",
    priceCurrent: 125,
    paymentPlan: "access until you pass",
    featuresIncluded: [
      "30+ hours of structured exam prep lessons",
      "2 live study groups each month",
      "Access until you pass",
    ],
    ctaLabel: "Start with Basics",
    ctaTarget: "/start-trial",
  },
  {
    slug: "premium",
    title: "Premium + Power Pack",
    subtitle: "Most chosen · Masters or Clinical track",
    priceCurrent: 175,
    priceOriginal: 225,
    paymentPlan: "access until you pass",
    featuresIncluded: [
      "Everything in Basics",
      "170-question practice exam and rationales",
      "Case vignettes with video rationales",
      "25+ recorded study groups",
      "Downloadable audio lessons",
      "Priority email and chat support",
    ],
    ctaLabel: "Choose Premium",
    ctaTarget: "/start-trial",
    badge: "80% of buyers choose this",
    featured: true,
  },
  {
    slug: "bsw",
    title: "BSW Exam Prep",
    subtitle: "One-time purchase · BSW track",
    priceCurrent: 125,
    paymentPlan: "access until you pass",
    featuresIncluded: [
      "Built specifically for the BSW exam",
      "Structured lessons with rationale review",
      "Free preview before purchase",
      "Designed for first-time confidence building",
    ],
    ctaLabel: "Explore BSW Prep",
    ctaTarget: "/start-trial?examTrack=BSW",
  },
];

export const defaultLandingPricingSections: PricingSection[] = [
  {
    id: "exam-prep-courses",
    title: "One-time exam prep courses",
    description: "Choose one-time exam prep with access until you pass and support that matches how you study best.",
    plans: [
      {
        id: "bsw-course",
        title: "BSW Exam Prep",
        subtitle: "Single package",
        price: 125,
        cadence: "one-time",
        features: [
          "30+ hours of visual and audio content",
          "Mock practice questions and test-taking strategies",
          "Access until you pass",
          "Free preview before purchase",
        ],
        ctaLabel: "Explore BSW prep",
        ctaHref: "/exam-prep",
      },
      {
        id: "lmsw-basics",
        title: "Masters Basics",
        subtitle: "LMSW · One-time purchase",
        price: 125,
        cadence: "one-time",
        features: [
          "30+ hours of content",
          "2 live study groups each month",
          "Access until you pass",
        ],
        ctaLabel: "Start Masters Basics",
        ctaHref: "/start-trial",
      },
      {
        id: "lmsw-premium",
        title: "Masters Premium + Power Pack",
        subtitle: "LMSW · Most chosen",
        price: 175,
        regularPrice: 225,
        cadence: "one-time",
        badge: "80% of buyers choose this",
        questionCount: 170,
        features: [
          "Everything in Basics",
          "170-question practice exam and rationales",
          "5 Bonus Topics: Cultural Considerations, SMART Goals, and more",
          "5 case vignettes with video rationales",
          "25+ recorded study groups",
          "Downloadable audio lessons",
          "Priority email and chat support",
        ],
        ctaLabel: "Choose Masters Premium",
        ctaHref: "/start-trial",
        tags: ["popular"],
      },
      {
        id: "lcsw-basics",
        title: "Clinical Basics",
        subtitle: "LCSW · One-time purchase",
        price: 125,
        cadence: "one-time",
        features: [
          "30+ hours of content",
          "2 live study groups each month",
          "Access until you pass",
        ],
        ctaLabel: "Start Clinical Basics",
        ctaHref: "/start-trial",
      },
      {
        id: "lcsw-premium",
        title: "Clinical Premium + Power Pack",
        subtitle: "LCSW · Advanced simulation",
        price: 175,
        regularPrice: 225,
        cadence: "one-time",
        questionCount: 170,
        features: [
          "Everything in Basics",
          "170-question practice exam and rationales",
          "15 case vignettes with video rationales",
          "Top 20 Clinical Terms + video explanations",
          "25+ recorded study groups",
          "Downloadable audio lessons",
          "Priority email and chat support",
        ],
        ctaLabel: "Choose Clinical Premium",
        ctaHref: "/start-trial",
        tags: ["popular"],
      },
    ],
  },
  {
    id: "continuing-education",
    title: "Continuing education membership",
    description: "For licensed social workers focused on renewal requirements and ongoing professional growth.",
    plans: [
      {
        id: "ce-annual",
        title: "Unlimited CE + Live Events",
        subtitle: "150+ courses · 15+ live webinars/year",
        price: 99,
        cadence: "annual",
        badge: "Standard CE plan",
        savingsCopy: "Test Prep users can transition into CE at $49 for the first year.",
        features: [
          "ASWB ACE provider #1919",
          "150+ on-demand CE course catalog",
          "15+ live webinars per year",
          "State-specific renewal guidance",
        ],
        ctaLabel: "Browse continuing education",
        ctaHref: "/continuing-education",
      },
    ],
  },
];

export const defaultOriginTimelineSteps: OriginTimelineStep[] = [
  {
    id: "high-school-year-1",
    era: "High School · Year 1",
    title: "Overwhelmed and falling behind",
    struggle:
      "Sally is balancing school pressure, family obligations, and late-night work with no consistent study structure.",
    shift:
      "She starts with small repeatable prep actions instead of all-or-nothing sessions: flashcards, focused questions, and a weekly checkpoint.",
    outcome: "Stability returns first; confidence follows.",
  },
  {
    id: "high-school-year-2",
    era: "High School · Year 2",
    title: "A mentor reframes the path",
    struggle:
      "Comparison fatigue and self-doubt keep pulling her back into reactive, last-minute studying.",
    shift:
      "Mentorship introduces planning filters: what matters now, what can wait, and what to eliminate.",
    outcome: "She moves from panic cycles to intentional momentum.",
  },
  {
    id: "high-school-year-3",
    era: "High School · Year 3",
    title: "Purpose discovery through service",
    struggle:
      "She questions whether college and long-term professional growth are realistic for her.",
    shift:
      "Volunteer work with youth support programs exposes social work as a meaningful, structured career path.",
    outcome: "Purpose becomes the engine for discipline.",
  },
  {
    id: "undergrad-foundation",
    era: "Undergrad",
    title: "Systems foundation in college",
    struggle:
      "Course load and practicum expectations create higher-stakes versions of earlier pressure points.",
    shift:
      "She builds reliable systems: timed study sprints, peer accountability, and reflective review loops.",
    outcome: "She strengthens process discipline, not just grades.",
  },
  {
    id: "post-grad-exam-prep",
    era: "Post-Grad",
    title: "Transition to exam-prep strategy",
    struggle:
      "ASWB preparation feels massive: broad content, limited time, and unclear prioritization.",
    shift:
      "She uses diagnostics and full-length practice exams with rationale review to target high-impact domains.",
    outcome: "Study time becomes measurable, focused, and strategic.",
  },
  {
    id: "licensure-and-ce",
    era: "Licensed Practice",
    title: "Licensure secured, CE maintained",
    struggle:
      "After passing, she worries about missing state-specific CE and renewal requirements.",
    shift:
      "She follows state-aware CE planning, check-ins, and reminders to avoid deadline spikes.",
    outcome: "Compliance becomes routine instead of stressful.",
  },
  {
    id: "doctorate-trajectory",
    era: "Doctorate Trajectory",
    title: "Doctorate-level growth planning",
    struggle:
      "She wants to move beyond compliance into leadership, research, and long-horizon impact.",
    shift:
      "She re-engages with advanced learning options, peer communities, and long-term development mapping.",
    outcome: "Her career trajectory shifts from maintenance to influence.",
  },
];

export const defaultSallyJourneySteps: SallyJourneyStep[] = [
  {
    id: "sally-start",
    chapter: "Chapter 1",
    title: "Sally starts with free prep tools",
    summary: "She uses flashcards, free questions, and the crash course to identify weak domains.",
    milestone: "Readiness baseline established",
    details: [
      "Reviews free flashcards for key concepts",
      "Completes 10 free practice questions per exam track",
      "Uses the crash course to map a realistic study cadence",
    ],
    ctaLabel: "Explore free resources",
    ctaHref: "/resources",
  },
  {
    id: "sally-practice",
    chapter: "Chapter 2",
    title: "She adds focused practice exams",
    summary: "Sally moves into the Premium package to train with full-length practice and stronger support.",
    milestone: "Exam-day strategy confidence grows",
    details: [
      "Completes practice exam sequences and reviews rationales",
      "Tracks wrong-answer patterns by KSA topic",
      "Uses data to prioritize high-impact study sessions",
    ],
    ctaLabel: "Compare exam options",
    ctaHref: "/exam-prep",
  },
  {
    id: "sally-license",
    chapter: "Chapter 3",
    title: "Sally passes and gets licensed",
    summary: "She sits for her ASWB exam with a clear pacing strategy and passes.",
    milestone: "Licensure secured",
    details: [
      "Confirms board paperwork after pass result",
      "Transitions from test prep into professional practice goals",
      "Prepares next milestones for license maintenance",
    ],
    ctaLabel: "See success stories",
    ctaHref: "/success-stories",
  },
  {
    id: "sally-ce",
    chapter: "Chapter 4",
    title: "She stays engaged through CE",
    summary: "Sally uses state-specific renewal guidance and ongoing CE coursework.",
    milestone: "Renewal compliance maintained",
    details: [
      "Checks required CE cadence for her practice state",
      "Uses Unlimited CE access for ongoing education",
      "Schedules renewal checkpoints before deadlines",
    ],
    ctaLabel: "View CE requirements by state",
    ctaHref: "/state-requirements",
  },
  {
    id: "sally-doctorate",
    chapter: "Chapter 5",
    title: "She prepares for doctorate-level growth",
    summary: "With licensure stable, Sally builds advanced learning momentum for doctoral goals.",
    milestone: "Long-term professional trajectory activated",
    details: [
      "Selects advanced CE topics aligned to research and leadership",
      "Stays active in peer communities for accountability",
      "Builds an ongoing academic and practice development plan",
    ],
    ctaLabel: "Browse continuing education",
    ctaHref: "/continuing-education",
  },
];

export const defaultTestimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    state: "CA",
    examTrack: "LCSW",
    quote:
      "I passed my LCSW exam on the first try. The rationales made difficult concepts finally click.",
    result: "Passed in 12 weeks",
    rating: 5,
    featured: true,
  },
  {
    name: "Michael T.",
    state: "TX",
    examTrack: "LMSW",
    quote:
      "The structured study plan kept me consistent. I studied during my commute and passed in three months.",
    result: "Passed in 3 months",
    rating: 5,
    featured: true,
  },
  {
    name: "Jennifer L.",
    state: "NY",
    examTrack: "LCSW",
    quote:
      "I needed both exam prep and CE. Agents of Change gave me everything in one place with clear guidance.",
    result: "40+ CE hours completed",
    rating: 5,
    featured: true,
  },
  {
    name: "Amanda R.",
    state: "OH",
    examTrack: "LSW",
    quote:
      "After previous failed attempts, this is what finally worked. The course explains the why, not just the answer.",
    result: "Passed after prior attempts",
    rating: 5,
    featured: true,
  },
  {
    name: "Jasmine K.",
    state: "FL",
    examTrack: "LMSW",
    quote:
      "The mock exams and weekly milestones reduced my stress. I felt prepared and focused on exam day.",
    result: "Passed on first attempt",
    rating: 5,
  },
  {
    name: "Troy B.",
    state: "WA",
    examTrack: "LCSW",
    quote:
      "My score jumped after two weeks using the diagnostic strategy and question rationales.",
    result: "Score improved by 18 points",
    rating: 5,
  },
];

export const defaultFaqItems: FaqItem[] = [
  {
    question: "How long do I have access to the exam prep program?",
    answer:
      "You keep access until you pass. There are no forced renewals for the exam prep access period.",
  },
  {
    question: "Which exams are covered?",
    answer:
      "The curriculum supports BSW, LSW, LMSW, and LCSW exam tracks with targeted study paths.",
  },
  {
    question: "Can I study on mobile?",
    answer:
      "Yes. The program is mobile-friendly and includes downloadable audio lessons for flexible study sessions.",
  },
  {
    question: "Are CE credits accepted in all states?",
    answer:
      "Agents of Change is an ASWB ACE provider (#1919). Check your state board page for detailed acceptance and limits.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Start with a free trial to sample lessons, explore the study approach, and see how the program fits your needs.",
  },
  {
    question: "What if I already failed the exam?",
    answer:
      "Many students join after previous attempts. The diagnostic approach identifies content and strategy gaps quickly.",
  },
];

export const defaultInstructor: InstructorProfile = {
  name: "Dr. Meagen Mitchell",
  title: "Licensed Clinical Social Worker and Lead Instructor",
  bio: [
    "Dr. Meagen Mitchell combines clinical social work experience with practical exam strategy coaching for first-time and repeat test takers.",
    "Her teaching focuses on high-yield domains, clear reasoning strategies, and realistic practice that mirrors ASWB-style thinking.",
  ],
  credentials: [
    "Licensed Clinical Social Worker",
    "10+ years of teaching and coaching",
    "ASWB ACE Provider #1919",
  ],
  imageAlt: "Portrait of Dr. Meagen Mitchell",
};

export const defaultSeoMetadata: SeoMetadata[] = [
  {
    key: "home",
    title: "Agents of Change | Social Work Exam Prep and Continuing Education",
    description:
      "Choose focused social work exam prep before licensure or continuing education after you pass.",
    path: "/",
  },
  {
    key: "exam-prep",
    title: "Exam Prep Programs | Agents of Change",
    description:
      "Compare social work exam prep options and choose the plan that matches your timeline and goals.",
    path: "/exam-prep",
  },
  {
    key: "success-stories",
    title: "Success Stories | Agents of Change",
    description:
      "Read real stories from social workers who passed with Agents of Change study plans and support.",
    path: "/success-stories",
  },
  {
    key: "start-trial",
    title: "Start Free Trial | Agents of Change",
    description:
      "Begin your free social work exam prep trial and get a personalized 7-day study plan.",
    path: "/start-trial",
  },
  {
    key: "about",
    title: "About Agents of Change | Social Work Exam Prep Experts",
    description:
      "Meet the team and teaching approach behind Agents of Change exam prep and continuing education.",
    path: "/about",
  },
  {
    key: "contact",
    title: "Contact Agents of Change | Support and Enrollment Help",
    description:
      "Get direct support for enrollment, exam planning, licensing guidance, and CE questions.",
    path: "/contact",
  },
  {
    key: "continuing-education",
    title: "Continuing Education Catalog | Agents of Change",
    description:
      "Browse CE courses for social workers by category, format, and license track requirements.",
    path: "/continuing-education",
  },
  {
    key: "resources",
    title: "Social Work Exam Resources | Agents of Change",
    description:
      "Explore study guides, strategy articles, and practical resources for social work exam prep.",
    path: "/resources",
  },
];

const ceDefaultsByState: Record<string, { ceHoursRequired: number; renewalCycleYears: number; ceNotes?: string }> = {
  CA: { ceHoursRequired: 36, renewalCycleYears: 2, ceNotes: "Includes law and ethics focus in many renewal cycles." },
  FL: { ceHoursRequired: 30, renewalCycleYears: 2, ceNotes: "Check board topics such as ethics and telehealth updates." },
  IL: { ceHoursRequired: 30, renewalCycleYears: 2, ceNotes: "Track cultural competence and ethics topic requirements." },
  NY: { ceHoursRequired: 36, renewalCycleYears: 3, ceNotes: "Review state-specific credits and periodic mandates." },
  TX: { ceHoursRequired: 30, renewalCycleYears: 2, ceNotes: "Confirm any jurisprudence and ethics requirements." },
  WA: { ceHoursRequired: 36, renewalCycleYears: 2, ceNotes: "Verify supervision and ethics-related CE obligations." },
};

export const defaultStateRequirements: StateRequirement[] = US_STATES.map((state) => {
  const ceDefaults = ceDefaultsByState[state.code] ?? {
    ceHoursRequired: 30,
    renewalCycleYears: 2,
    ceNotes: "Confirm exact CE categories and board rules before renewal.",
  };

  return {
    stateCode: state.code,
    stateName: state.name,
    requirements: [
      "Verify degree and supervised practice requirements with your state board.",
      "Confirm ASWB exam level and registration process for your license track.",
      "Check renewal cadence, CE hours, and ethics-specific credit requirements.",
    ],
    boardUrl: "https://www.aswb.org/licensing/",
    updatedAt: "2026-02-17",
    metaDescription: `Social work licensing requirements and exam preparation guidance for ${state.name}.`,
    ceHoursRequired: ceDefaults.ceHoursRequired,
    renewalCycleYears: ceDefaults.renewalCycleYears,
    ceNotes: ceDefaults.ceNotes,
  };
});

export const footerLinkGroups = [
  {
    heading: "Programs",
    links: [
      { label: "Exam Prep", href: "/exam-prep" },
      { label: "Continuing Education", href: "/continuing-education" },
      { label: "Practice Exams", href: "/exam-prep#offers" },
      { label: "Community", href: "/community" },
      { label: "State Requirements", href: "/state-requirements" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Success Stories", href: "/success-stories" },
      { label: "Resources Hub", href: "/resources" },
      { label: "About", href: "/about" },
      { label: "Start Free Trial", href: "/start-trial" },
      { label: "Contact Support", href: "mailto:support@agentsofchangeprep.com" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Email", href: "mailto:support@agentsofchangeprep.com" },
    ],
  },
] as const;

export const defaultAudiencePathways: AudiencePathway[] = [
  {
    id: "first-time",
    title: "First-time test taker",
    summary: "Build confidence fast with a week-by-week curriculum and test-day strategy map.",
    ctaLabel: "Plan My First 30 Days",
    ctaHref: "/start-trial?pathway=first-time&studyTimeline=this_month",
  },
  {
    id: "repeat",
    title: "Retaking after prior attempts",
    summary: "Use diagnostic feedback and rationale-driven practice to close high-impact score gaps.",
    ctaLabel: "Run a Diagnostic Plan",
    ctaHref: "/start-trial?pathway=repeat&studyTimeline=immediate",
  },
  {
    id: "ce-focus",
    title: "Already licensed and focused on CE",
    summary: "Go straight into renewal planning, practical coursework, and CE options built for licensed social workers.",
    ctaLabel: "Explore CE options",
    ctaHref: "/continuing-education",
  },
];

export const defaultCompetencyDomains: CompetencyDomain[] = [
  {
    id: "ethics",
    title: "Ethics and Professional Values",
    scoreLift: "+18 avg score lift",
    description:
      "Learn practical decision tools for boundary scenarios, confidentiality issues, and best-next-action questions.",
  },
  {
    id: "assessment",
    title: "Assessment and Intervention",
    scoreLift: "+14 avg score lift",
    description:
      "Use clear assessment and intervention logic to answer scenario-based questions faster.",
  },
  {
    id: "practice",
    title: "Practice Management",
    scoreLift: "+11 avg score lift",
    description:
      "Master supervision, documentation, and service coordination patterns that appear in exam sets.",
  },
];

export const defaultStudyPhases: StudyPhase[] = [
  {
    phase: "Phase 1",
    timeline: "Week 1",
    objective: "Baseline diagnostic and personalized 7-day action plan.",
  },
  {
    phase: "Phase 2",
    timeline: "Weeks 2-4",
    objective: "Domain-focused learning blocks with rationale-driven question drills.",
  },
  {
    phase: "Phase 3",
    timeline: "Weeks 5-8",
    objective: "Timed simulation exams, confidence calibration, and final weak-area remediation.",
  },
];

export const defaultCareerPhases: CareerPhase[] = [
  {
    step: "Step 1",
    title: "Sign up for Licensing Exam",
    description: "Submit your application to the ASWB and your state board, then schedule your exam date.",
  },
  {
    step: "Step 2",
    title: "Exam Preparation",
    description: "Follow a structured, milestone-driven study plan to build rationale and scenario confidence.",
  },
  {
    step: "Step 3",
    title: "Pass Your Exam",
    description: "Walk into the test center with a calm, strategic mindset and achieve a passing score.",
  },
  {
    step: "Step 4",
    title: "Maintain Licensure",
    description: "Obtain necessary continuing education (CE) credits every 2-3 years to renew your license.",
  },
];

export const defaultStoryPairings: StoryPairing[] = [
  {
    context: "Decision speed under pressure",
    before: "Second-guessing answer choices and running out of time.",
    after: "Consistent elimination strategy with enough time for review.",
  },
  {
    context: "Rationale confidence",
    before: "Memorizing facts without knowing why answers are correct.",
    after: "Pattern recognition and clear reasoning for scenario responses.",
  },
  {
    context: "Study consistency",
    before: "Irregular, low-yield study sessions.",
    after: "Structured weekly milestones and accountable progress checkpoints.",
  },
];

export const defaultContactPathways: ContactPathway[] = [
  {
    id: "enrollment",
    title: "Enrollment and plan selection",
    description: "Get direct help choosing the right prep package for your exam timeline.",
    responseTime: "Response in 1 business day",
    actionLabel: "Email Enrollment Support",
    actionHref: "mailto:support@agentsofchangeprep.com?subject=Enrollment%20Support",
  },
  {
    id: "licensing",
    title: "Licensing and state requirement guidance",
    description: "Clarify state-specific expectations and identify next steps for your track.",
    responseTime: "Response in 1-2 business days",
    actionLabel: "Request Licensing Guidance",
    actionHref: "mailto:support@agentsofchangeprep.com?subject=Licensing%20Guidance",
  },
  {
    id: "ce",
    title: "Continuing education support",
    description: "Find CE courses by category, hours, and state relevance for renewals.",
    responseTime: "Response in 1 business day",
    actionLabel: "Contact CE Team",
    actionHref: "mailto:support@agentsofchangeprep.com?subject=CE%20Support",
  },
];

export const defaultCeCatalog: CECourse[] = [
  {
    id: "ce-trauma",
    title: "Trauma-Informed Care for Clinical Practice",
    category: "Clinical",
    ceHours: 6,
    format: "self-paced",
    audience: "all",
    featured: true,
  },
  {
    id: "ce-ethics",
    title: "Ethics, Boundaries, and Documentation Decisions",
    category: "Ethics",
    ceHours: 4,
    format: "self-paced",
    audience: "all",
    featured: true,
  },
  {
    id: "ce-supervision",
    title: "Effective Supervision for Social Work Teams",
    category: "Leadership",
    ceHours: 3,
    format: "live",
    audience: "LCSW",
  },
  {
    id: "ce-crisis",
    title: "Crisis Intervention and Safety Planning",
    category: "Clinical",
    ceHours: 5,
    format: "live",
    audience: "LMSW",
  },
  {
    id: "ce-cultural",
    title: "Culturally Responsive Assessment and Communication",
    category: "Equity",
    ceHours: 2,
    format: "self-paced",
    audience: "all",
  },
  {
    id: "ce-policy",
    title: "Policy, Systems, and Community-Level Practice",
    category: "Macro Practice",
    ceHours: 3,
    format: "self-paced",
    audience: "LSW",
  },
];

export const defaultResourceArticles: ResourceArticle[] = [
  {
    slug: "lcsw-study-plan-8-weeks",
    title: "How to Build an 8-Week LCSW Study Plan",
    category: "Study Strategy",
    readTime: "8 min",
    excerpt: "A week-by-week structure for maximizing score lift without burnout.",
  },
  {
    slug: "aswb-question-rationale",
    title: "How to Read ASWB-Style Questions for Signal",
    category: "Exam Tactics",
    readTime: "6 min",
    excerpt: "A practical guide to identifying stem clues and avoiding distractors.",
  },
  {
    slug: "state-requirements-checklist",
    title: "State Requirement Checklist Before You Schedule",
    category: "Licensing",
    readTime: "7 min",
    excerpt: "A pre-scheduling checklist that prevents avoidable licensing delays.",
  },
  {
    slug: "study-after-failed-attempt",
    title: "What to Change After a Failed Attempt",
    category: "Recovery Strategy",
    readTime: "9 min",
    excerpt: "A diagnostic process to identify weak domains and rebuild your prep plan.",
  },
];
