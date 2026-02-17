import type {
  AudiencePathway,
  CECourse,
  CompetencyDomain,
  ContactPathway,
  FaqItem,
  InstructorProfile,
  NavItem,
  ProgramOffer,
  ResourceArticle,
  SeoMetadata,
  SiteSettings,
  StoryPairing,
  StateRequirement,
  StatItem,
  StudyPhase,
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
  { label: "Programs", href: "/exam-prep" },
  { label: "Continuing Education", href: "/continuing-education" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Resources", href: "/resources" },
  { label: "State Requirements", href: "/state-requirements/ca" },
  { label: "About", href: "/about" },
  { label: "Start Free Trial", href: "/start-trial", primary: true },
];

export const defaultStats: StatItem[] = [
  { value: "10,000+", label: "Licensed Social Workers" },
  { value: "95%", label: "First-Time Pass Rate" },
  { value: "150+", label: "CE Courses Available" },
  { value: "50", label: "States Recognized" },
];

export const defaultProgramOffers: ProgramOffer[] = [
  {
    slug: "exam-prep",
    title: "Exam Prep",
    subtitle: "LSW, LMSW, and LCSW preparation",
    priceCurrent: 179,
    featuresIncluded: [
      "Complete video lesson library",
      "500+ practice questions with rationales",
      "Monthly live study groups",
      "Downloadable audio files",
      "Access until you pass",
    ],
    ctaLabel: "Start Free Trial",
    ctaTarget: "/start-trial?plan=exam-prep",
  },
  {
    slug: "exam-prep-ce-bundle",
    title: "Exam Prep + CE Bundle",
    subtitle: "Best value for exam and career growth",
    priceCurrent: 229,
    priceOriginal: 378,
    featuresIncluded: [
      "Everything in Exam Prep",
      "150+ CE courses",
      "12+ live CE events annually",
      "Unlimited CEU credits for 1 year",
      "Priority Q&A support",
    ],
    ctaLabel: "Start Free Trial",
    ctaTarget: "/start-trial?plan=bundle",
    badge: "Best Value",
    featured: true,
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
      "I needed both exam prep and CE. The bundle gave me everything in one place with clear guidance.",
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
      "The curriculum supports LSW, LMSW, and LCSW exam tracks with targeted study paths.",
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
      "Yes. Start with a free trial to experience the platform, sample lessons, and strategy modules.",
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
    "Her teaching model focuses on high-yield domains, decision frameworks, and realistic practice that mirrors ASWB-style thinking.",
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
      "Pass your LMSW, LCSW, or LSW exam with confidence. Expert-led prep, practical study plans, and CE support.",
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
      "Read real outcomes from social workers who passed with Agents of Change study systems.",
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
      "Meet the team and teaching framework behind Agents of Change exam prep and CE guidance.",
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

export const defaultStateRequirements: StateRequirement[] = US_STATES.map((state) => ({
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
}));

export const footerLinkGroups = [
  {
    heading: "Programs",
    links: [
      { label: "Exam Prep", href: "/exam-prep" },
      { label: "Continuing Education", href: "/continuing-education" },
      { label: "Bundle", href: "/exam-prep#offers" },
      { label: "State Requirements", href: "/state-requirements/ca" },
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
    ctaHref: "/start-trial?pathway=first-time",
  },
  {
    id: "repeat",
    title: "Retaking after prior attempts",
    summary: "Use diagnostic feedback and rationale-driven practice to close high-impact score gaps.",
    ctaLabel: "Run a Diagnostic Plan",
    ctaHref: "/start-trial?pathway=repeat",
  },
  {
    id: "ce-focus",
    title: "Exam plus CE growth",
    summary: "Pair licensing prep with curated CE modules aligned to state renewal expectations.",
    ctaLabel: "Compare Exam + CE",
    ctaHref: "/continuing-education",
  },
];

export const defaultCompetencyDomains: CompetencyDomain[] = [
  {
    id: "ethics",
    title: "Ethics and Professional Values",
    scoreLift: "+18 avg score lift",
    description:
      "Learn decision frameworks for boundary scenarios, confidentiality issues, and best-next-action logic.",
  },
  {
    id: "assessment",
    title: "Assessment and Intervention",
    scoreLift: "+14 avg score lift",
    description:
      "Use structured assessment pathways and intervention sequencing to answer scenario stems faster.",
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
    excerpt: "A practical framework for identifying stem clues and avoiding distractors.",
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
