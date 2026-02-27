# npx-resume

> Show your resume in the terminal with a single `npx` command.

```bash
npx npx-resume yourname
```

---

## What is this?

npx-resume lets developers publish their resume as a beautiful terminal experience. Upload your PDF, get a personalized `npx` command, share it anywhere — GitHub bio, LinkedIn, Twitter. Anyone who runs it sees your resume rendered with colors and clean formatting right in their terminal.

---

## Full Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  GitHub OAuth → PDF Upload → Markdown Preview → Save → npx  │
└───────────────────────┬─────────────────────────────────────┘
                        │ POST /api/parse  (PDF file)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Hono Server (Vercel Serverless)                │
│         pdf-parse → Groq LLM → Markdown text response       │
└───────────────────────┬─────────────────────────────────────┘
                        │ Markdown string returned to frontend
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Appwrite (BaaS)                           │
│         GitHub OAuth Auth + Database (resume as markdown)   │
└─────────────────────────────────────────────────────────────┘
                        │ fetched at runtime
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  npm CLI Package                             │
│     `npx npx-resume yourname` → fetches + renders resume    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast DX |
| Styling | Tailwind CSS + shadcn/ui | Clean UI |
| Markdown Preview | react-markdown | Renders AI output directly |
| Auth | Appwrite GitHub OAuth | Free, no verification hassle |
| Database | Appwrite Database | Stores resume markdown per user |
| API Server | Hono on Vercel | Lightweight, free hosting |
| PDF Parsing | pdf-parse (Node) | Server-side, PDF never stored |
| AI | Groq (Llama 3.3 70B) | Free tier, fast inference |
| CLI | Node.js + chalk + boxen | Terminal rendering |

---

## Project Structure

```
npx-resume/
├── apps/
│   ├── web/                  # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── UploadZone.tsx
│   │   │   │   ├── ResumePreview.tsx   # react-markdown renders the string
│   │   │   │   └── NpxCommand.tsx
│   │   │   ├── lib/
│   │   │   │   ├── appwrite.ts
│   │   │   │   └── api.ts
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Home.tsx
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── server/               # Hono API server
│       ├── api/
│       │   └── index.ts      # Vercel entrypoint
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   └── parse.ts
│       │   ├── middleware/
│       │   │   ├── cors.ts
│       │   │   └── rateLimit.ts
│       │   └── lib/
│       │       ├── pdfParser.ts
│       │       └── groq.ts
│       ├── vercel.json
│       └── package.json
│
└── packages/
    └── cli/                  # npm CLI package
        ├── bin/
        │   └── cli.js
        ├── src/
        │   ├── fetch.ts
        │   └── render.ts
        └── package.json
```

---

## User Flow

### 1. Authentication
- User visits the web app
- Clicks "Sign in with GitHub"
- Appwrite handles OAuth, creates a session
- On first login, user picks a slug (default: their GitHub username)
- Slug is checked for uniqueness in Appwrite DB

### 2. Resume Upload
- User drags or selects their resume PDF
- PDF is sent as `multipart/form-data` to the Hono server
- **The PDF is never stored** — only the text is processed
- Hono extracts text with `pdf-parse`, sends to Groq
- Groq returns the resume as clean, well-formatted markdown
- Markdown string is returned to the frontend

### 3. Preview & Confirm
- The markdown is rendered in the browser using `react-markdown`
- User sees their full resume as extracted — all sections, all details, nothing skipped
- User hits "Publish" to confirm and save

### 4. Save to Appwrite
- The markdown string is saved to Appwrite Database under the user's document
- Slug stored as a unique indexed field
- User sees their command: `npx npx-resume <slug>`

### 5. CLI Usage
- Anyone runs `npx npx-resume <slug>`
- CLI fetches the markdown string from Appwrite
- Renders it in the terminal with chalk styling on top

---

## What the AI Returns

Instead of structured JSON, Groq returns the resume as clean markdown. This keeps everything simple:

- No schema to define or maintain
- No JSON parsing, no edge cases
- Preview is just `react-markdown` — zero extra logic
- CLI renders the same text with terminal colors
- Works for any resume format naturally

Example of what Groq returns:

```markdown
# Jane Doe
**Senior Software Engineer** | San Francisco, CA
jane@example.com | github.com/janedoe | janedoe.dev

## Summary
Experienced engineer with 8 years building distributed systems...

## Experience

### Acme Corp — Senior Engineer (2021–Present)
- Led migration to microservices, reducing deploy time by 40%
- Mentored a team of 5 junior engineers

### StartupXYZ — Engineer (2018–2021)
- Built the core API from scratch in Node.js and PostgreSQL

## Skills
TypeScript, React, Node.js, PostgreSQL, Docker, AWS

## Education
### UC Berkeley — B.S. Computer Science (2018)
```

The AI is instructed to extract everything and let the structure reflect the actual resume — no fixed schema, no assumptions.

---

## Appwrite Setup

### Auth
- Enable **GitHub OAuth** in Appwrite Console
- Set callback URL to your frontend domain

### Database

**Collection: `resumes`**

| Field | Type | Notes |
|---|---|---|
| `userId` | String | Appwrite user ID |
| `slug` | String | Unique index |
| `github` | String | GitHub username |
| `resumeText` | String | Full markdown from AI |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

### Permissions
- `resumes` collection: **anyone can read** (required for CLI), only authenticated users can write their own document

---

## Environment Variables

### Hono Server (`apps/server/.env`)
```env
GROQ_API_KEY=your_groq_key
ALLOWED_ORIGIN=https://your-frontend-domain.com
```

### React Frontend (`apps/web/.env`)
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
VITE_PARSE_API_URL=https://your-hono-server.vercel.app
```

---

## Security

### API Server
- CORS restricted to known origin only in production
- Rate limiting on `/api/parse` — 5 requests per IP per minute
- File type validation (PDF only) and size cap (5MB)
- `GROQ_API_KEY` only in Vercel env vars, never in client
- No file storage — PDF processed in memory and discarded

### Frontend
- Appwrite sessions handled by Appwrite's secure cookie system, not localStorage
- Appwrite client key scoped to read-only on `resumes` collection

### Appwrite
- `resumes` publicly readable, writable only by document owner

### CLI
- Read-only. No write access. No data collected from CLI users.

---

## Development

```bash
git clone https://github.com/you/npx-resume
cd npx-resume && bun install

# Frontend
cd apps/web && bun dev

# Server
cd apps/server && bun dev

# CLI
cd packages/cli && node bin/cli.js testslug
```

---

## Deployment

```bash
# Server → Vercel
cd apps/server && vercel deploy

# Frontend → Vercel / Netlify / Cloudflare Pages
# Standard Vite build

# CLI → npm
cd packages/cli && npm publish --access public
```

---

## Roadmap

- [ ] Custom slug on signup
- [ ] Resume update flow (re-upload PDF)
- [ ] Public profile page at `npx-resume.app/yourname`
- [ ] View count per resume
- [ ] Multiple CLI color themes
- [ ] OpenRouter as Groq fallback