// @ts-ignore — pdf-parse is a CommonJS module
import pdfParse from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        const data = await pdfParse(buffer);

        if (!data.text || data.text.trim().length === 0) {
            throw new Error("PDF appears to be empty or contains no extractable text.");
        }

        return data.text;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
        throw new Error("Failed to parse PDF: Unknown error occurred.");
    }
}
