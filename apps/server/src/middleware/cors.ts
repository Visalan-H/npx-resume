import { cors } from "hono/cors";

export function createCorsMiddleware() {
    const isProduction = process.env.NODE_ENV === "production";
    const origin = isProduction
        ? process.env.ALLOWED_ORIGIN || ""
        : "http://localhost:5173";

    return cors({
        origin,
        allowMethods: ["POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
    });
}
