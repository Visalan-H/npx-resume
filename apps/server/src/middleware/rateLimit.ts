import { rateLimiter } from "hono-rate-limiter";
import type { Context } from "hono";

export function createRateLimiter() {
    return rateLimiter({
        windowMs: 60 * 1000, // 1 minute
        limit: 5,
        keyGenerator: (c: Context) => {
            return c.req.header("x-forwarded-for") || "unknown";
        },
        handler: (c: Context) => {
            return c.json(
                { success: false, error: "Too many requests. Try again in a minute." },
                429
            );
        },
    });
}
