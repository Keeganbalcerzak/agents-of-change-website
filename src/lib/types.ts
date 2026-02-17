export type ExamTrack = "LSW" | "LMSW" | "LCSW";
export type MotionTier = "none" | "micro" | "section" | "hero";
export type ThemeIntent = "default" | "editorial" | "conversion" | "trust";

export type UIState = "default" | "hover" | "focus" | "active" | "disabled" | "error";

export interface SectionDesignConfig {
  themeIntent: ThemeIntent;
  motionTier: MotionTier;
  density: "compact" | "regular" | "expanded";
  visualVariant: string;
}

export interface ComponentVariantContract {
  componentId: string;
  variant: string;
  states: UIState[];
  accessibilityNotes: string[];
}

export type NewSchemaDocs = "pageModule" | "designVariant" | "assetBrief" | "ctaPattern";

export type NewDesignEvents =
  | "module_view"
  | "section_engagement"
  | "filter_interaction"
  | "form_validation_error";

export interface NavItem {
  label: string;
  href: string;
  primary?: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  supportEmail: string;
  supportPhone: string;
  aceProviderNumber: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface ProgramOffer {
  slug: string;
  title: string;
  subtitle: string;
  priceCurrent: number;
  priceOriginal?: number;
  featuresIncluded: string[];
  ctaLabel: string;
  ctaTarget: string;
  badge?: string;
  featured?: boolean;
}

export interface Testimonial {
  name: string;
  state: string;
  examTrack: ExamTrack;
  quote: string;
  result: string;
  rating: number;
  featured?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InstructorProfile {
  name: string;
  title: string;
  bio: string[];
  credentials: string[];
  imageAlt: string;
}

export interface StateRequirement {
  stateCode: string;
  stateName: string;
  requirements: string[];
  boardUrl: string;
  updatedAt: string;
  metaDescription: string;
}

export interface SeoMetadata {
  key: string;
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface TrialLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  examTrack: ExamTrack;
  state: string;
  targetExamWindow: "0-30" | "31-60" | "61-90" | "90+";
  studyTimeline: "immediate" | "this_month" | "next_quarter";
  consentToEmail: boolean;
  sourcePage: string;
  utm: Record<string, string | undefined>;
}

export interface TrialLeadResult {
  success: boolean;
  leadId?: string;
  hubspotContactId?: string;
  errorCode?: "VALIDATION_ERROR" | "HUBSPOT_ERROR" | "RATE_LIMITED";
}

export interface AudiencePathway {
  id: string;
  title: string;
  summary: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface CompetencyDomain {
  id: string;
  title: string;
  scoreLift: string;
  description: string;
}

export interface StudyPhase {
  phase: string;
  timeline: string;
  objective: string;
}

export interface CECourse {
  id: string;
  title: string;
  category: string;
  ceHours: number;
  format: "self-paced" | "live";
  audience: "LMSW" | "LCSW" | "LSW" | "all";
  featured?: boolean;
}

export interface ResourceArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
}

export interface ContactPathway {
  id: string;
  title: string;
  description: string;
  responseTime: string;
  actionLabel: string;
  actionHref: string;
}

export interface StoryPairing {
  context: string;
  before: string;
  after: string;
}
