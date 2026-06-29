# Vowed

**Free, open-source wedding planning that actually works.**

Built by a frustrated couple who got tired of TheKnot's phantom saves, broken guest counts, and vendor ads masquerading as tools.

## What's different

- **Group/family counts on every view**, not just when unfiltered. TheKnot drops this when you filter by RSVP status. We don't.
- **Optimistic saves with local backup**. Data saves locally first, then syncs to the cloud. No more "it vanished when I came back."
- **Fast queries** via edge SQLite on Turso. Guest lists load in milliseconds.
- **Real budget tracking** with actual line items, paid vs. estimated, and no vendor ads.
- **Honest checklist** with date-relative tasks that update when you change your wedding date.

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + custom design tokens
- **Drizzle ORM** + **Turso** (SQLite edge database, free tier)
- **Clerk** for auth (free tier)
- **Vercel** for hosting (free tier)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/swperb/vowed
cd vowed
npm install
```

### 2. Set up accounts (all free)

- [Clerk](https://clerk.com) for auth. Create an app, grab your keys.
- [Turso](https://turso.tech) for the database. `turso db create vowed`
- [Vercel](https://vercel.com) for hosting. Connect your GitHub repo.

### 3. Configure environment

```bash
cp .env.example .env.local
# Fill in CLERK keys and TURSO credentials
```

### 4. Set up database

```bash
npm run db:push       # Push schema to Turso
npm run db:studio     # Visual DB explorer (optional)
```

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Main app shell
│   ├── guests/               # Guest list (the main fix)
│   ├── budget/               # Budget tracker
│   ├── checklist/            # Task checklist
│   ├── rsvp/[slug]/          # Public RSVP page
│   └── api/                  # API routes
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Database schema (all tables)
│   │   ├── guests.ts         # Guest queries with correct group counts
│   │   ├── budget.ts         # Budget queries
│   │   └── checklist-defaults.ts  # Default task templates
│   └── utils/                # Formatters, helpers
└── components/               # Shared UI components
```

## Key design decisions

### Guest list: groups as first-class objects

TheKnot tracks individuals and then tries to infer families. We do it the other way: `guest_groups` is the primary entity (one row = one invitation/household), and `guests` are members of a group. This means:

- Group/family counts are always correct
- Filtering by RSVP status finds groups that *contain* matching members, then shows all members of those groups in context
- Every filtered view shows both "X guests matching" and "Y groups matching"

### Optimistic saves

Every write updates local state immediately, then syncs to the API. If the API call fails, we roll back and show an error. Users never wait for a spinner to see their changes.

### Free stack

The entire free tier runs on:
- Turso: 9GB storage, 500 databases, more than enough for one wedding
- Clerk: 10,000 monthly active users
- Vercel: generous free tier for personal projects

Total cost to run your own instance: **$0**.

## Monetization (if you're building on this)

See `MONETIZATION.md` for the recommended freemium model:
- Free web app (this repo)
- Paid iOS native app with Apple ecosystem integrations
- Optional ethical vendor listings (flat fee, cancel anytime, no 12-month traps)

## Contributing

PRs welcome. Issues with specific bugs get priority. See `CONTRIBUTING.md`.

## License

MIT. Use it, fork it, build on it. Just don't pretend you built it from scratch.
