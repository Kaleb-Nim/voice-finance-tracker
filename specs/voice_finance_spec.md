# Voice Finance Tracker – Technical Specification Document

## 1. Overview

**Voice Finance Tracker** is a full-stack application that enables users to track expenses and manage their budgets using voice input. The system will use **Deepgram API** for speech-to-text (STT), **Supabase** for authentication and backend database/storage, and **Next.js** for the frontend and API routes.

## 2. Tech Stack

- **Frontend:** Next.js 14 (React Server Components, App Router)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Speech-to-Text:** Deepgram API
- **Realtime:** Supabase Realtime (Postgres replication)
- **Deployment:** Vercel

---

## 3. System Architecture

### High-Level Diagram

```
[Client UI - Next.js] ──> [Next.js API Route] ──> [Deepgram API] ──> [Supabase DB/API] ──> [Client UI (Live Feedback)]
                        └─────────────Supabase Auth + Storage────────────┘
```

### Core Modules

- **Auth Module**: Supabase Auth (email, social logins, magic links)
- **Voice Capture Module**: Records audio, sends blob to backend
- **Transcription Module**: Handles Deepgram request and stores result
- **Finance Parser Module**: Extracts category, amount, vendor from text
- **Budget Engine**: Categorization rules, summaries, budget tracking
- **Data Visualizer**: Graphs and insights on frontend using React/Victory/D3

---

## 4. Frontend – Next.js

### Pages/Routes

- `/` - Home/Landing
- `/dashboard` - User dashboard with summary view
- `/transactions` - Transaction list
- `/settings` - Preferences, budgeting rules

### Components

- `VoiceRecorder.tsx` – audio recording + waveform + send to API
- `TransactionList.tsx` – table of expenses
- `BudgetSummary.tsx` – charts + progress bars
- `Insights.tsx` – weekly/monthly reports

### State Management

- Context API or Zustand for global state
- SWR or React Query for server sync

---

## 5. Backend – API Routes (Next.js + Supabase)

### `/api/record/upload`

- Accepts audio blob (WAV/MP3)
- Sends audio to Deepgram API
- Returns transcription text

### `/api/transaction/parse`

- Accepts transcription text
- Extracts intent: amount, category, vendor
- Saves structured data in Supabase DB

### `/api/transactions`

- `GET`: Fetch user transactions
- `POST`: Add manual transaction

### `/api/summary`

- Returns budget summaries
- Breakdowns by category, timeframe

---

## 6. Supabase Schema

### Tables

#### `users`

- `id`: UUID (PK)
- `email`
- `created_at`

#### `transactions`

- `id`: UUID
- `user_id`: FK -> users.id
- `amount`: float
- `vendor`: text
- `category`: text
- `timestamp`: timestamp
- `raw_text`: text (from STT)

#### `budgets`

- `id`, `user_id`, `category`, `monthly_limit`

#### `preferences`

- `user_id`, `currency`, `default_input_method`

---

## 7. Deepgram Integration

### Flow

- User records voice
- Blob sent to `/api/record/upload`
- Backend sends blob to Deepgram:

```ts
await fetch('https://api.deepgram.com/v1/listen', { ... })
```

- Response includes `transcript`

### Example Result:

```json
{
  "transcript": "Spent 12 dollars on coffee at Starbucks"
}
```

---

## 8. NLP & Parsing (Server-side)

### Input

- Raw transcription from Deepgram

### Output

- Extracted JSON:

```json
{
  "amount": 12,
  "category": "coffee",
  "vendor": "Starbucks"
}
```

### Techniques

- Rule-based parsing initially
- Later: fine-tuned transformer via HuggingFace or OpenAI function calling

---

## 9. Authentication & Security

- Supabase Auth (email magic link, OAuth)
- RLS (Row-Level Security) to enforce user access
- Token-based calls to Supabase DB
- Secure audio storage via Supabase Storage (optionally delete after parse)

---

## 10. Notifications & Cron

- Supabase Edge Functions or CRON jobs for:
  - Weekly summary emails
  - Budget threshold alerts

---

## 11. Analytics & Logs

- Client: Vercel Analytics, PostHog
- Server/API: Supabase Logs + Sentry (optional)

---

## 12. Future Enhancements

- Smart voice tagging: “Business expense” → auto-category
- Shared budgeting (households)
- Smartwatch mic integration
- Offline-first with local IndexedDB cache
- AI-based auto budget generation

---

## 13. Deployment & DevOps

- Frontend: Vercel (CI/CD with GitHub)
- Supabase: Self-hosted optional, default hosted
- Secrets via Vercel Environment Variables
- GitHub Actions: Lint, Typecheck, Deploy Preview

---

## 14. Dev Environment Setup

```bash
npx create-next-app@latest voice-finance-tracker
cd voice-finance-tracker
npm install @supabase/supabase-js zustand react-query
```

- Add `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DEEPGRAM_API_KEY=...
```

---

**End of Spec**

