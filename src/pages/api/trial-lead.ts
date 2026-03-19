import type { APIRoute } from "astro";
import { isIP } from "node:net";
import { z } from "zod";
import type { TrialLeadResult } from "@/lib/types";

export const prerender = false;

const MAX_SOURCE_PAGE_LENGTH = 2048;

const schema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(190),
  examTrack: z.enum(["LSW", "LMSW", "LCSW"]),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  targetExamWindow: z.enum(["0-30", "31-60", "61-90", "90+"]),
  studyTimeline: z.enum(["immediate", "this_month", "next_quarter"]),
  consentToEmail: z.literal(true),
  sourcePage: z.string().trim().min(1).max(MAX_SOURCE_PAGE_LENGTH).regex(/^\/[^\s]*$/),
  utm: z.record(z.string().max(120).optional()).default({}),
});

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimit = new Map<string, RateLimitState>();
const WINDOW_MS = 60 * 1000;
const WINDOW_MAX = 10;
const RATE_LIMIT_PRUNE_INTERVAL_MS = 30 * 1000;
const MAX_RATE_LIMIT_ENTRIES = 20000;
let lastRateLimitPruneAt = 0;

function extractFirstValidIp(rawHeader: string): string | undefined {
  const parts = rawHeader.split(",");
  for (const part of parts) {
    const candidate = part.trim();
    if (candidate && isIP(candidate) !== 0) {
      return candidate;
    }
  }
  return undefined;
}

function hashForAnonymousClient(input: string): string {
  // Small deterministic hash keeps anonymous fallback keys compact.
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function getClientIdentifier(request: Request, clientAddress?: string): string {
  if (clientAddress && isIP(clientAddress) !== 0) {
    return `ip:${clientAddress}`;
  }

  const rawCandidates = [
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for"),
  ];

  for (const rawCandidate of rawCandidates) {
    if (!rawCandidate) {
      continue;
    }

    const ip = extractFirstValidIp(rawCandidate);
    if (ip) {
      return `ip:${ip}`;
    }
  }

  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  return `anon:${hashForAnonymousClient(`${userAgent}|${acceptLanguage}`)}`;
}

function pruneRateLimit(now: number): void {
  if (
    now - lastRateLimitPruneAt < RATE_LIMIT_PRUNE_INTERVAL_MS &&
    rateLimit.size <= MAX_RATE_LIMIT_ENTRIES
  ) {
    return;
  }

  lastRateLimitPruneAt = now;

  for (const [key, state] of rateLimit.entries()) {
    if (now > state.resetAt) {
      rateLimit.delete(key);
    }
  }

  if (rateLimit.size <= MAX_RATE_LIMIT_ENTRIES) {
    return;
  }

  const overflow = rateLimit.size - MAX_RATE_LIMIT_ENTRIES;
  let removed = 0;
  for (const key of rateLimit.keys()) {
    rateLimit.delete(key);
    removed += 1;
    if (removed >= overflow) {
      break;
    }
  }
}

function enforceRateLimit(ip: string): boolean {
  const now = Date.now();
  pruneRateLimit(now);
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
  const sourcePageUrl = new URL(lead.sourcePage, origin).toString();

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
            website: sourcePageUrl,
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

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  const clientIdentifier = getClientIdentifier(request, clientAddress);
  if (!enforceRateLimit(clientIdentifier)) {
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
    if (import.meta.env.DEV) {
      const syntheticLeadId = `local-${Date.now()}`;
      return jsonResponse({
        success: true,
        leadId: syntheticLeadId,
        hubspotContactId: syntheticLeadId,
      });
    }

    console.error("Missing HUBSPOT_PRIVATE_APP_TOKEN in non-dev environment");
    return jsonResponse({ success: false, errorCode: "HUBSPOT_ERROR" }, 503);
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
