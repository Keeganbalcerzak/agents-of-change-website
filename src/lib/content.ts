import {
  defaultAudiencePathways,
  defaultCeCatalog,
  defaultCompetencyDomains,
  defaultContactPathways,
  defaultFaqItems,
  defaultInstructor,
  defaultNavItems,
  defaultProgramOffers,
  defaultResourceArticles,
  defaultSeoMetadata,
  defaultSiteSettings,
  defaultStoryPairings,
  defaultStateRequirements,
  defaultStats,
  defaultStudyPhases,
  defaultTestimonials,
} from "@/lib/defaultContent";
import { sanityClient, sanityEnabled } from "@/lib/sanity/client";
import {
  faqItemsQuery,
  instructorProfileQuery,
  navItemsQuery,
  programOffersQuery,
  seoMetadataQuery,
  siteSettingsQuery,
  stateRequirementsQuery,
  testimonialsQuery,
} from "@/lib/sanity/queries";
import type {
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
  AudiencePathway,
  CompetencyDomain,
  ContactPathway,
  CECourse,
} from "@/lib/types";

async function fetchSafe<T>(query: string, fallback: T): Promise<T> {
  if (!sanityEnabled || !sanityClient) {
    return fallback;
  }

  try {
    const result = await sanityClient.fetch<T>(query);
    if (!result) {
      return fallback;
    }

    if (Array.isArray(result) && result.length === 0) {
      return fallback;
    }

    return result;
  } catch (error) {
    console.warn("Sanity fetch failed, using fallback content", error);
    return fallback;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return fetchSafe<SiteSettings>(siteSettingsQuery, defaultSiteSettings);
}

export async function getNavItems(): Promise<NavItem[]> {
  return fetchSafe<NavItem[]>(navItemsQuery, defaultNavItems);
}

export async function getProgramOffers(): Promise<ProgramOffer[]> {
  return fetchSafe<ProgramOffer[]>(programOffersQuery, defaultProgramOffers);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return fetchSafe<Testimonial[]>(testimonialsQuery, defaultTestimonials);
}

export async function getFaqItems(): Promise<FaqItem[]> {
  return fetchSafe<FaqItem[]>(faqItemsQuery, defaultFaqItems);
}

export async function getInstructorProfile(): Promise<InstructorProfile> {
  return fetchSafe<InstructorProfile>(instructorProfileQuery, defaultInstructor);
}

export async function getStateRequirements(): Promise<StateRequirement[]> {
  return fetchSafe<StateRequirement[]>(stateRequirementsQuery, defaultStateRequirements);
}

export async function getSeoMetadata(): Promise<SeoMetadata[]> {
  return fetchSafe<SeoMetadata[]>(seoMetadataQuery, defaultSeoMetadata);
}

export function getDefaultStats(): StatItem[] {
  return defaultStats;
}

export function getAudiencePathways(): AudiencePathway[] {
  return defaultAudiencePathways;
}

export function getCompetencyDomains(): CompetencyDomain[] {
  return defaultCompetencyDomains;
}

export function getStudyPhases(): StudyPhase[] {
  return defaultStudyPhases;
}

export function getStoryPairings(): StoryPairing[] {
  return defaultStoryPairings;
}

export function getContactPathways(): ContactPathway[] {
  return defaultContactPathways;
}

export function getCeCatalog(): CECourse[] {
  return defaultCeCatalog;
}

export function getResourceArticles(): ResourceArticle[] {
  return defaultResourceArticles;
}
