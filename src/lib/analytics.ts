export type AnalyticsEventName =
  | "cta_click"
  | "trial_step_view"
  | "trial_step_complete"
  | "trial_submit"
  | "trial_submit_success"
  | "trial_submit_error"
  | "module_view"
  | "section_engagement"
  | "data_phase_complete"
  | "filter_interaction"
  | "form_validation_error"
  | "story_chapter_view"
  | "pricing_plan_select"
  | "tracker_workflow_preview";

export function trackEvent(eventName: AnalyticsEventName, params: Record<string, string | number | boolean | undefined> = {}): void {
  if (typeof window === "undefined") {
    return;
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );

  const maybeGtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (maybeGtag) {
    maybeGtag("event", eventName, cleanedParams);
  }

  const maybeDataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (maybeDataLayer) {
    maybeDataLayer.push({ event: eventName, ...cleanedParams });
  }
}
