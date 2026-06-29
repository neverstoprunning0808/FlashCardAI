# Flash Card AI

A full-stack flashcard learning platform with AI-powered card generation, user authentication, and subscription-based feature gating. Built as a portfolio demo to showcase practical AI engineering skills in a production-style Next.js application.

**Live demo:** https://flashcardai-delta.vercel.app 

---

## Why This Project

This app demonstrates how to integrate LLMs into a real product — not as a standalone script, but as a secure, typed, user-facing feature inside a modern web stack. It covers the full lifecycle: auth, persistence, billing gates, structured AI output, and a polished UI.

## Features

### Core Learning Experience

- **Deck management** — Create, edit, and delete flashcard decks
- **Manual card CRUD** — Add, edit, and remove individual cards
- **Study mode** — Flip cards, navigate, shuffle, and track correct/incorrect answers with progress stats

### AI-Powered Generation (Pro)

- **One-click generation** — Pro users can generate 20 flashcards from a deck's title and description
- **Structured outputs** — Uses the Vercel AI SDK with Zod schemas so LLM responses are validated before saving
- **Server-side only** — AI calls run in Server Actions, never exposed to the client

### Authentication & Billing

- **Clerk authentication** — Sign up / sign in via modal flows
- **Route protection** — Middleware redirects unauthenticated users to the homepage
- **Clerk Billing** — Free vs Pro plans with feature-based access control

| Plan | Decks | AI Generation |
|------|-------|---------------|
| Free | Up to 2 | No |
| Pro  | Unlimited | Yes |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Auth & Billing | [Clerk](https://clerk.com/) |
| Database | [Neon Postgres](https://neon.tech/) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) + [OpenAI](https://openai.com/) |
| UI | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4 |
| Validation | [Zod](https://zod.dev/) |

---

## Architecture Highlights

### Data Layer Pattern

All database access goes through query helpers in `db/queries/`. Server Components and Server Actions never import the database client directly.

```
Server Component / Server Action
        ↓
   db/queries/*.ts   (reads & writes)
        ↓
      db/index.ts    (Drizzle + Neon connection)
        ↓
     PostgreSQL
```

### AI Generation Flow

```
User clicks "Generate with AI"
        ↓
Server Action: generateCardsWithAI()
  ├── auth() — verify userId
  ├── has({ feature: 'ai_flashcard_generation' }) — Pro check
  ├── getDeckById() — verify deck ownership
  ├── generateObject() — OpenAI + Zod schema
  └── insertCards() — persist validated cards
```

### Security Checklist (implemented)

- Every protected route verifies `auth()` server-side
- All queries filter by `userId` to scope data per user
- Resource ownership is checked before updates and deletes
- Premium features are gated with `has()` on the server (not just in the UI)
- All Server Action inputs are validated with Zod schemas

---

## Project Structure

```
app/
├── page.tsx                          # Landing page (sign in / sign up)
├── dashboard/                        # User dashboard & deck overview
│   ├── page.tsx
│   ├── actions.ts                    # createDeck, editDeck, removeDeck
│   └── *.tsx                         # Deck dialogs & cards
├── decks/[deckId]/
│   ├── page.tsx                      # Deck detail & card list
│   ├── actions.ts                    # Card CRUD + AI generation
│   ├── generate-ai-cards-button.tsx  # Pro-gated AI trigger
│   └── study/                        # Interactive study mode
├── pricing/page.tsx                  # Clerk PricingTable
└── layout.tsx                        # ClerkProvider + global layout

db/
├── index.ts                          # Drizzle database client
├── schema.ts                         # decks & cards tables
└── queries/
    ├── decks.ts                      # Deck query/mutation helpers
    └── cards.ts                      # Card query/mutation helpers

components/ui/                        # shadcn/ui components
middleware.ts                         # Clerk route protection
drizzle.config.ts                     # Drizzle Kit configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Accounts on [Clerk](https://clerk.com/), [Neon](https://neon.tech/), and [OpenAI](https://platform.openai.com/)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd CursorAI_Nextjs
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon Postgres
DATABASE_URL=postgresql://...

# OpenAI (for AI flashcard generation)
OPENAI_API_KEY=sk-...
```

See [CLERK_SETUP.md](./CLERK_SETUP.md) and [DRIZZLE_SETUP.md](./DRIZZLE_SETUP.md) for detailed setup guides.

### 3. Set up the database

Push the schema to your Neon database:

```bash
npm run db:push
```

Optional: open Drizzle Studio to inspect data:

```bash
npm run db:studio
```

### 4. Configure Clerk Billing (optional, for Pro features)

In the Clerk Dashboard, set up:

- **Plans:** `free_user`, `pro`
- **Features:** `2_deck_limit`, `unlimited_decks`, `ai_flashcard_generation`

Assign features to plans so free users are limited to 2 decks and Pro users unlock AI generation.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to the database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio |

---

## Key Implementation Details

### Structured AI Output

AI generation uses `generateObject` with a Zod schema to ensure every card has valid `front` and `back` fields before insertion:

```typescript
const { object } = await generateObject({
  model: openai('gpt-5-nano'),
  schema: flashcardSchema,
  prompt: `Generate 20 flashcards about ...`,
});
```

### Feature Gating

Server-side enforcement (authoritative):

```typescript
const hasAIGeneration = has({ feature: 'ai_flashcard_generation' });
if (!hasAIGeneration) {
  throw new Error("AI flashcard generation requires a Pro subscription");
}
```

Client-side UX with Clerk `<Show>` (non-authoritative, for UI only):

```tsx
<Show when={{ feature: "ai_flashcard_generation" }} fallback={...}>
  <Button>Generate with AI</Button>
</Show>
```

---

## Screenshots

_Add screenshots of the dashboard, deck view, study mode, and AI generation here._

---

## What I Would Add Next

- Spaced repetition scheduling (SM-2 or similar)
- Streaming AI generation with real-time card preview
- Deck sharing and public study links
- Usage analytics and generation history
- E2E tests with Playwright

---

## License

This project is for portfolio and demonstration purposes.
