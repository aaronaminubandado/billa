# Billa – Personal Expense Tracker

Billa is a modern web application for tracking personal finances, built with Next.js 14 and Supabase. It offers a clean, intuitive interface to manage income, expenses, budgets, and financial goals.

## Development Status

This project is in beta. Mobile layouts and some features (reports export, advanced filters) are still in progress.

## Features

- Authentication (email/password and OAuth via Supabase)
- Dashboard with financial metrics and charts
- Transactions, categories, wallets, budgets, and goals
- Dark/light theme

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, Middleware)
- **Database & Auth**: Supabase (PostgreSQL, Auth)
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Validation**: Zod
- **Icons**: Lucide

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase project

### Installation

```bash
git clone https://github.com/aaronaminubandado/billa
cd billa
pnpm install
```

Copy [`.env.example`](.env.example) to `.env.local` and set your Supabase URL and anon key from **Project Settings → API**.

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build (includes ESLint) |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest unit tests |
| `pnpm verify:rls` | Verify RLS in live DB (requires `DATABASE_URL`) |

## Project Structure

```
├── app/              # Next.js App Router routes
├── components/       # UI components
├── hooks/            # React hooks
├── lib/              # Utilities, validation, types, lib/data access
├── supabase/         # Migrations, audit scripts, security docs
└── utils/supabase/   # Supabase client helpers
```

## Supabase & security

See [`supabase/README.md`](supabase/README.md) for migration order and [`supabase/SECURITY.md`](supabase/SECURITY.md) for the security checklist.

## Deployment

Deploy to Vercel (or similar) and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host environment. Never expose the service role key to the client.

## License

MIT
