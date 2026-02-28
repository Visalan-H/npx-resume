import { createAdaptorServer } from "@hono/node-server";
import app from "../src/index.js";

export const config = { api: { bodyParser: false } };
export default createAdaptorServer(app);