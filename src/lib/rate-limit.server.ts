/**
 * Minimal in-memory sliding-window rate limiter for public server functions.
 *
 * Caveat: the worker runtime keeps this per isolate, so the limit is
 * best-effort — it stops naive floods and repeat submissions, not a
 * distributed attack. A shared store would be needed for hard guarantees.
 */

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

/** Best-effort client IP from Cloudflare / proxy headers. */
export function clientIpFromHeaders(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return (fwd.split(",")[0] ?? "").trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMinutes: number;
}

export function checkRateLimit(
  scope: string,
  ip: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const key = `${scope}:${ip}`;

  if (buckets.size > MAX_KEYS) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0] ?? now;
    const retryMs = Math.max(windowMs - (now - oldest), 60_000);
    return { allowed: false, retryAfterMinutes: Math.ceil(retryMs / 60_000) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterMinutes: 0 };
}
