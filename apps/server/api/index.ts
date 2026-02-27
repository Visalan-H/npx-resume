import app from "../src/index";
import { handle } from "hono/vercel";

export const config = {
    api: {
        bodyParser: false, // CRITICAL — do not remove
    },
};

export default handle(app);
