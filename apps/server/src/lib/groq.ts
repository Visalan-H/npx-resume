import OpenAI from "openai";

const client = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a resume parser. Extract every piece of information from the resume text and return it as a single valid JSON object. No markdown, no backticks, no explanation — only the raw JSON.

The JSON must follow this exact schema:

{
  "name": "string — full name",
  "title": "string — job title or headline",
  "sections": [
    // CONTACT section — always first if contact info exists
    {
      "heading": "Contact",
      "type": "contact",
      "items": [
        { "label": "GitHub", "url": "https://..." },
        { "label": "Email", "url": "mailto:email@example.com" },
        { "label": "Phone", "value": "+1 234 567 8900" },
        { "label": "Website", "url": "https://..." }
      ]
    },

    // TAGS section — for skills, tools, technologies (flat lists of short items)
    {
      "heading": "Skills",
      "type": "tags",
      "items": ["React", "Node.js", "TypeScript"]
    },

    // ENTRIES section — for jobs, projects, education, extensions (structured items with bullets)
    {
      "heading": "Experience",
      "type": "entries",
      "items": [
        {
          "title": "Senior Engineer",
          "org": "Acme Corp",
          "date": "2021–Present",
          "url": null,
          "bullets": ["Led migration to...", "Reduced latency by..."]
        }
      ]
    },

    // TEXT section — for summaries, bios, single paragraphs
    {
      "heading": "Summary",
      "type": "text",
      "content": "Experienced engineer with..."
    },

    // LIST section — for anything else that doesn't fit the above
    {
      "heading": "Certifications",
      "type": "list",
      "items": ["AWS Certified Solutions Architect", "Google Cloud Professional"]
    }
  ]
}

Rules:
- Use "contact" for all contact/social links
- Use "tags" for skills, tools, languages, technologies — always flat arrays of short strings
- Use "entries" for experience, projects, education, extensions, packages, publications
- Use "text" for summaries or paragraphs
- Use "list" for anything else
- For entries: "title" is required, "org"/"date"/"url" are optional (use null if missing)
- For contact items: use "url" for anything with a link (including mailto:), use "value" for phone/plain text
- Extract EVERYTHING — do not skip any section, any bullet point, any detail
- Preserve all URLs exactly as they appear in the resume
- Return ONLY the JSON object. Nothing else.`

export async function convertResumeToJSON(resumeText: string): Promise<string> {
    const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: resumeText }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
        throw new Error("Groq returned an empty response. Please try again.")
    }

    // validate it's actually parseable JSON before returning
    try {
        JSON.parse(content)
    } catch {
        throw new Error("AI returned invalid JSON. Please try again.")
    }

    return content
}