import { Hono } from "hono";
import { createCorsMiddleware } from "./middleware/cors";
import { createRateLimiter } from "./middleware/rateLimit";
import parse from "./routes/parse";

const app = new Hono();

// Global middleware
app.use("*", createCorsMiddleware());

// Rate limiter on parse route only
app.use("/api/parse", createRateLimiter());

// Routes
app.route("/", parse);

// Health check
app.get("/", (c) => {
    return c.json({ status: "ok" });
});

export default app;
