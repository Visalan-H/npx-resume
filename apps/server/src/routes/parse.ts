import { Hono } from "hono";
import { extractTextFromPDF } from "../lib/pdfParser.js";
import { convertResumeToJSON } from "../lib/groq.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const parse = new Hono();

parse.post("/api/parse", async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body["resume"];

        // Validate file exists
        if (!file || !(file instanceof File)) {
            return c.json(
                { success: false, error: "Missing resume file. Upload a PDF using the 'resume' field." },
                400
            );
        }

        // Validate content type
        if (file.type !== "application/pdf") {
            return c.json(
                { success: false, error: "Invalid file type. Only PDF files are accepted." },
                400
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return c.json(
                { success: false, error: "File too large. Maximum size is 5MB." },
                413
            );
        }

        // Convert to buffer and extract text
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const rawText = await extractTextFromPDF(buffer);
        const json = await convertResumeToJSON(rawText);

        return c.json({ success: true, data: json });
    } catch (error) {
        console.error("Error processing resume:", error);
        return c.json({ success: false, error: "Failed to process resume. Please try again." }, 500);
    }
});

export default parse;
