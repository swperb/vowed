import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Free-tier IP rate limiting via Upstash. No-ops (allows all) until
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, so the
// app runs fine locally and in CI without the dependency configured.
const configured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const limiter = configured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "vowed/rl",
      analytics: false,
    })
  : null;

export async function rateLimit(identifier: string): Promise<boolean> {
  if (!limiter) return true;
  const { success } = await limiter.limit(identifier);
  return success;
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";
}
