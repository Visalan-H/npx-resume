import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

export async function convertResumeToMarkdown(resumeText: string): Promise<string> {
    const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "user",
                content: `You are a resume formatter. Extract every single piece of information from the resume text below.
Do not skip, omit, or summarize anything. Format it as clean, well-structured markdown.
Use ## for section headers, bold for job titles and company names, and bullet points for responsibilities and achievements.
Return only the markdown. No explanation, no preamble, no text before or after the markdown.

Resume text:
${resumeText}`,
            },
        ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
        throw new Error("Groq returned an empty response. Please try again.");
    }

    return content.replace(/^```(?:markdown)?\n?/, '').replace(/\n?```$/, '').trim();
}
