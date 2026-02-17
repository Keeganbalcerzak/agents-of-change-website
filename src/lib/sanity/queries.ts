export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteName,
  tagline,
  primaryCtaLabel,
  primaryCtaHref,
  supportEmail,
  supportPhone,
  aceProviderNumber
}`;

export const navItemsQuery = `*[_type == "navItem"] | order(order asc){
  label,
  href,
  primary
}`;

export const programOffersQuery = `*[_type == "programOffer"] | order(order asc){
  "slug": slug.current,
  title,
  subtitle,
  priceCurrent,
  priceOriginal,
  featuresIncluded,
  ctaLabel,
  ctaTarget,
  badge,
  featured
}`;

export const testimonialsQuery = `*[_type == "testimonial"] | order(order asc){
  name,
  state,
  examTrack,
  quote,
  result,
  rating,
  featured
}`;

export const faqItemsQuery = `*[_type == "faqItem"] | order(order asc){
  question,
  answer
}`;

export const instructorProfileQuery = `*[_type == "instructorProfile"][0]{
  name,
  title,
  bio,
  credentials,
  imageAlt
}`;

export const stateRequirementsQuery = `*[_type == "stateRequirement"] | order(stateCode asc){
  stateCode,
  stateName,
  requirements,
  boardUrl,
  "updatedAt": coalesce(updatedAt, _updatedAt),
  metaDescription
}`;

export const seoMetadataQuery = `*[_type == "seoMetadata"]{
  key,
  title,
  description,
  path,
  ogImage,
  noindex
}`;

export const pageModulesQuery = `*[_type == "pageModule"] | order(order asc){
  moduleId,
  pagePath,
  themeIntent,
  motionTier,
  headline,
  body,
  order
}`;

export const designVariantsQuery = `*[_type == "designVariant"]{
  componentId,
  variant,
  states,
  accessibilityNotes,
  usageGuidelines
}`;

export const assetBriefsQuery = `*[_type == "assetBrief"]{
  assetId,
  assetType,
  priority,
  brief,
  acceptanceCriteria
}`;

export const ctaPatternsQuery = `*[_type == "ctaPattern"]{
  patternId,
  label,
  href,
  locationRules,
  intent
}`;
