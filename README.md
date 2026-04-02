# Homey

Household management app for two. Currently ships a fully-featured smart shopping list.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma · PostgreSQL (Neon) · NextAuth v5 · SCSS Modules · Vitest

---

## What's built

**Smart shopping list**
- Multiple lists with drag-and-drop reorder (dnd-kit)
- Product autocomplete — catalog + purchase history + frequency-based suggestions
- Inline quantity/price editing, category filter, optimistic updates
- PWA-ready with swipe-to-dismiss bottom sheets

**Architecture worth noting:**
- Household isolation enforced at every query (`householdId` from session, never from input)
- React 19 `useOptimistic` + `useReducer` for instant UI with server reconciliation
- Atomic server actions — Zod → auth check → DB, one operation per file
- Compound component system (Modal, BottomSheet, Popover) — zero UI libraries
- WCAG 2.1 AA — focus traps, `aria-live`, full keyboard navigation

---

## Setup

```bash
pnpm install
cp .env.example .env.local
npx prisma migrate dev
pnpm dev
```

```env
DATABASE_URL=      # PostgreSQL (Neon free tier works)
AUTH_SECRET=       # openssl rand -base64 32
NEXTAUTH_URL=      # http://localhost:3000
```

---

## Scripts

```bash
pnpm dev        # dev server
pnpm build      # production build
pnpm validate   # lint + typecheck + tests
```

---

MIT
