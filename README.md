# showresume

> Show your resume in the terminal with a single `npx` command.

```bash
npx showresume yourname
```

---

## What is this?

showresume lets developers publish their resume as a beautiful terminal experience. Upload your PDF, get a personalized `npx` command, share it anywhere — GitHub bio, LinkedIn, Twitter. Anyone who runs it sees your resume rendered with colors and clean formatting right in their terminal.

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
│       pdf-parse → Groq LLM → Zod Validation → JSON          │
└───────────────────────┬─────────────────────────────────────┘
                        │ JSON schema returned to frontend
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Appwrite (BaaS)                           │
│         GitHub OAuth Auth + Database (resume as JSON)       │
└─────────────────────────────────────────────────────────────┘
                        │ fetched at runtime
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  npm CLI Package                             │
│     `npx showresume yourname` → fetches + renders resume    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer       | Tech                      | Why                                        |
| ----------- | ------------------------- | ------------------------------------------ |
| Frontend    | React + Vite + TypeScript | Fast DX                                    |
| Styling     | Tailwind CSS + shadcn/ui  | Clean UI                                   |
| Validation  | Zod                       | Prevents LLM hallucinations on the backend |
| Auth        | Appwrite GitHub OAuth     | Free, no verification hassle               |
| Database    | Appwrite Database         | Stores structured JSON resume              |
| API Server  | Hono on Vercel            | Lightweight, free hosting                  |
| PDF Parsing | pdf-parse (Node)          | Server-side, PDF never stored              |
| AI          | Groq (Llama 3.1 8B)       | Free tier, fast JSON inference             |
| CLI         | Node.js + chalk + boxen   | Terminal rendering                         |

---

## Project Structure

```
showresume/
├── apps/
│   ├── web/                  # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── UploadZone.tsx
│   │   │   │   ├── ResumePreview.tsx   # Visual representation of the JSON
│   │   │   │   ├── ResumeEditor.tsx    # Live JSON editor
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
- Hono extracts text with `pdf-parse`, truncates it for security, and sends it to Groq
- Groq returns a fully structured JSON payload
- Hono strictly validates the payload against a `zod` schema before returning to the client

### 3. Preview & Edit

- The structured JSON is rendered visually in the React frontend
- Users can review the output
- If the AI missed or formatted anything incorrectly, the user enters the **Resume Editor** and modifies the sections safely

### 4. Save to Appwrite

- The pure JSON string is saved to Appwrite Database beneath the user's document
- Slug stored as a unique indexed field
- User sees their command: `npx showresume <slug>`

### 5. CLI Usage

- Anyone runs `npx showresume <slug>`
- CLI fetches the JSON string from Appwrite
- CLI renders the JSON dynamically using custom section handlers and Chalk styling

---

## The Resume JSON Schema

Instead of relying on Markdown which requires LLM prompt-engineering and fragile string parsing, we use a rigid JSON format backed by **Zod**.

- Structure is guaranteed
- Safe handling of injected urls on the frontend
- Much easier rendering for both the React interface and the CLI

Example of the strict JSON format returned by the AI and saved to Appwrite:

```json
{
  "name": "Jane Doe",
  "title": "Senior Software Engineer",
  "sections": [
    {
      "heading": "Contact",
      "type": "contact",
      "items": [{ "label": "github", "url": "https://github.com/janedoe" }]
    },
    {
      "heading": "Experience",
      "type": "entries",
      "items": [
        {
          "title": "Senior Engineer",
          "org": "Acme Corp",
          "date": "2021-Present",
          "bullets": ["Led migration to microservices"]
        }
      ]
    }
  ]
}
```

---

## Appwrite Setup

### Auth

- Enable **GitHub OAuth** in Appwrite Console
- Set callback URL to your frontend domain

### Database

**Collection: `resumes`**

| Field        | Type     | Notes                           |
| ------------ | -------- | ------------------------------- |
| `userId`     | String   | Appwrite user ID                |
| `slug`       | String   | Unique index                    |
| `resumeData` | String   | Stringified JSON schema payload |
| `createdAt`  | DateTime | Auto                            |
| `updatedAt`  | DateTime | Auto                            |

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
git clone https://github.com/you/showresume
cd showresume && bun install

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
- [ ] Public profile page at `showresume.app/yourname`
- [ ] View count per resume
- [ ] Multiple CLI color themes
- [ ] OpenRouter as Groq fallback
