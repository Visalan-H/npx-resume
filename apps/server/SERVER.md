# showresume — Hono Server

The API server for showresume. One job: accept a PDF, extract text, send to Groq, return the resume as clean markdown. Deployed as a Vercel serverless function.

---

## What this server does

```
POST /api/parse
  ← multipart/form-data with PDF file (field: "resume")
  → { success: true, data: { name, title, sections: [...] } }
```

One route. Accepts a PDF, extracts text, asks Groq for structured JSON, validates it against a strict Zod schema, and returns the data.

---

## Stack

- **Runtime**: Bun (local) / Node.js (Vercel)
- **Framework**: Hono
- **PDF Parsing**: `pdf-parse`
- **AI**: Groq (Llama 3.3 70B) via OpenAI-compatible SDK
- **Deployment**: Vercel free tier

---

## Project Structure

```
server/
├── api/
│   └── index.ts          # Vercel entrypoint
├── src/
│   ├── index.ts          # Hono app + middleware
│   ├── routes/
│   │   └── parse.ts      # POST /api/parse
│   ├── middleware/
│   │   ├── cors.ts
│   │   └── rateLimit.ts
│   └── lib/
│       ├── pdfParser.ts  # pdf-parse wrapper
│       └── groq.ts       # Groq call + prompt
├── vercel.json
├── package.json
└── .env.example
```

---

## Setup

```bash
bun install
```

`.env`:

```env
GROQ_API_KEY=your_groq_api_key
ALLOWED_ORIGIN=https://your-frontend.com
NODE_ENV=development
```

Get your free Groq key at [console.groq.com](https://console.groq.com)

```bash
bun dev   # runs at http://localhost:3000
```

---

## API Reference

### `POST /api/parse`

**Request**

```
Content-Type: multipart/form-data
Body: { resume: <PDF file> }
```

**Success** `200`

```json
{
  "success": true,
  "data": {
    "name": "Jane Doe",
    "title": "Senior Engineer",
    "sections": [...]
  }
}
```

**Errors**

| Status | Reason                  |
| ------ | ----------------------- |
| `400`  | No file or not a PDF    |
| `413`  | File over 5MB           |
| `429`  | Rate limit exceeded     |
| `500`  | Parsing or Groq failure |

---

## Implementation Details

### `src/lib/pdfParser.ts`

Takes a Buffer, runs `pdf-parse`, returns raw text string. Throws on failure. The PDF never touches disk — buffer only.

### `src/lib/groq.ts`

Takes raw resume text, slices it to `20_000` chars to prevent prompt injection, and calls Groq to extract structured data.

```
You are a resume data extractor. Your only job is to extract resume information from the text provided and return it as structured JSON.
...
```

It expects a structured JSON object matching our `ResumeSchema`. Before returning, the raw JSON string is verified and strictly validated using **Zod**. If the AI hallucinates bad data, the validation fails and a 500 is safely returned.

### `src/routes/parse.ts`

- Reads file from multipart body
- Validates: file exists, is PDF, under 5MB
- Calls pdfParser → groq
- Truncates input to 20K characters, validates structure via Zod
- Returns `{ success: true, data: json }`
- On error: logs internally, returns generic `{ success: false, error: "..." }`

### `src/middleware/cors.ts`

- Production: `ALLOWED_ORIGIN` env var only
- Development: `http://localhost:5173`
- Methods: `POST`, `OPTIONS`

### `src/middleware/rateLimit.ts`

- `hono-rate-limiter`: 5 requests per IP per minute
- Key: `x-forwarded-for` header (set by Vercel)
- Exceed: `429 { success: false, error: "Too many requests. Try again in a minute." }`

---

## Vercel Config

### `vercel.json`

```json
{
  "rewrites": [{ "source": "/api/(.*)", "destination": "/api/index" }]
}
```

### `api/index.ts`

```ts
import app from "../src/index";
import { handle } from "hono/vercel";

export const config = {
  api: { bodyParser: false }, // critical — do not remove
};

export default handle(app);
```

`bodyParser: false` is critical. If Vercel parses the body first, multipart handling breaks.

---

## Deploy

```bash
vercel deploy --prod
```

Set in Vercel dashboard → Project Settings → Environment Variables:

- `GROQ_API_KEY`
- `ALLOWED_ORIGIN`
- `NODE_ENV=production`

---

## Security Checklist

- [x] CORS locked to known origin in production
- [x] Rate limited: 5 req/min/IP
- [x] PDF only, 5MB max
- [x] API key server-side only
- [x] No file storage — memory only
- [x] Errors logged server-side, generic message to client
- [x] `bodyParser: false` set

---

## Test with curl

```bash
# Basic test
curl -X POST http://localhost:3000/api/parse \
  -F "resume=@/path/to/resume.pdf"

# Health check
curl http://localhost:3000/

# Test rate limit (6th request should 429)
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/parse \
    -F "resume=@resume.pdf"
done
```

---

## Dependencies

```json
{
  "dependencies": {
    "hono": "^4.x",
    "pdf-parse": "^1.1.1",
    "openai": "^4.x",
    "hono-rate-limiter": "^0.x"
  },
  "devDependencies": {
    "bun-types": "latest",
    "@types/node": "latest",
    "typescript": "^5.x"
  }
}
```
