import type { APIRoute } from "astro";
import { z } from "zod";
import type { TrialLeadResult } from "@/lib/types";

export const prerender = false;

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(190),
  examTrack: z.enum(["LSW", "LMSW", "LCSW"]),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  targetExamWindow: z.enum(["0-30", "31-60", "61-90", "90+"]),
  studyTimeline: z.enum(["immediate", "this_month", "next_quarter"]),
  consentToEmail: z.literal(true),
  sourcePage: z.string().trim().min(1).max(300),
  utm: z.record(z.string().max(120).optional()).default({}),
});

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimit = new Map<string, RateLimitState>();
const WINDOW_MS = 60 * 1000;
const WINDOW_MAX = 10;

function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function enforceRateLimit(ip: string): boolean {
  const now = Date.now();
  const state = rateLimit.get(ip);

  if (!state || now > state.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (state.count >= WINDOW_MAX) {
    return false;
  }

  state.count += 1;
  rateLimit.set(ip, state);
  return true;
}

async function pushLeadToHubSpot(token: string, lead: z.infer<typeof schema>, origin: string): Promise<string | undefined> {
  const endpoint = "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      inputs: [
        {
          idProperty: "email",
          id: lead.email,
          properties: {
            email: lead.email,
            firstname: lead.firstName,
            lastname: lead.lastName,
            state: lead.state,
            jobtitle: `Social Work ${lead.examTrack} candidate`,
            website: `${origin}${lead.sourcePage}`,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HubSpot request failed (${response.status}): ${errorBody}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{ id?: string }>;
  };

  return payload.results?.[0]?.id;
}

function jsonResponse(body: TrialLeadResult, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const POST: APIRoute = async ({ request, url }) => {
  const ip = getClientIp(request);
  if (!enforceRateLimit(ip)) {
    return jsonResponse({ success: false, errorCode: "RATE_LIMITED" }, 429);
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return jsonResponse({ success: false, errorCode: "VALIDATION_ERROR" }, 400);
  }

  const parsed = schema.safeParse(parsedBody);
  if (!parsed.success) {
    return jsonResponse({ success: false, errorCode: "VALIDATION_ERROR" }, 400);
  }

  const hubspotToken = import.meta.env.HUBSPOT_PRIVATE_APP_TOKEN;

  if (!hubspotToken) {
    const syntheticLeadId = `local-${Date.now()}`;
    return jsonResponse({
      success: true,
      leadId: syntheticLeadId,
      hubspotContactId: syntheticLeadId,
    });
  }

  try {
    const hubspotId = await pushLeadToHubSpot(hubspotToken, parsed.data, url.origin);
    return jsonResponse({
      success: true,
      leadId: `hubspot-${hubspotId || Date.now()}`,
      hubspotContactId: hubspotId,
    });
  } catch (error) {
    console.error("HubSpot submission failed", error);
    return jsonResponse({ success: false, errorCode: "HUBSPOT_ERROR" }, 502);
  }
};
