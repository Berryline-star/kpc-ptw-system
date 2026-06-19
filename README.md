# KPC Digital Permit-to-Work (PTW) System

Digital Permit-to-Work management and safety-compliance system for Kenya
Pipeline Company, built from the "Industrial Integrity System" design
(KPC Blue / Safety Orange, Inter typeface, Stitch-generated screens).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · PostgreSQL · Prisma
· Auth.js · React Context API · Vercel

## Status: Phase 3 — App shell ✅

What's in this commit:

- All authenticated pages now live under a shared `(app)` route group
  (`src/app/(app)/layout.tsx`) that checks the session once and renders
  the shell around every child page — no more per-page auth boilerplate.
- **Sidebar** (desktop, `src/components/layout/sidebar.tsx`) and
  **bottom tab bar** (mobile, `src/components/layout/bottom-nav.tsx`),
  both driven by one role-aware config (`src/lib/config/nav.ts`) so
  visibility per role is defined in exactly one place.
- **Topbar** with search (visual only for now — wires up once Permits
  exists), notifications bell, and user identity.
- Refactored `middleware.ts`/`auth.config.ts` to a **public-routes
  allowlist** instead of enumerating protected routes — every new page
  added under `(app)` in later phases is automatically protected, no
  middleware edits needed per route.
- Stub "Coming in Phase N" pages for Permits, Approvals, Risk
  Assessments, Reports, Notifications, and Admin — so the nav is fully
  clickable today instead of 404ing.
- A real (not stubbed) **Profile** page showing account info + sign out.
- Homepage now links to `/login` instead of being a dead end.

### Setup from scratch

1. **Database** — go to console.neon.tech, sign up, create a project.
   On the dashboard, copy the **pooled** connection string (has
   `-pooler` in the hostname) into `DATABASE_URL`, and the **direct**
   string (no `-pooler`) into `DIRECT_DATABASE_URL`. Copy `.env.example`
   to `.env` first (it's git-ignored, so credentials never get
   committed).
2. **Auth secret** — add to the same `.env`:
   ```
   AUTH_SECRET=   # generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
3. **Install + migrate + seed**:
   ```bash
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
4. **Run it**:
   ```bash
   npm run dev
   ```
   Go to `/login` and sign in with any seeded user, e.g.
   `safety.officer@kpc.co.ke` / `Password123!`.

## Roadmap

1. ~~Foundations~~ done
2. ~~Data layer~~ done
3. ~~Auth~~ done
4. ~~App shell~~ done
5. **Operations dashboard** — stat cards, trend chart, risk donut, activity
   feed
6. **Permit creation wizard** — 4-step flow (Type/Location, Details/Dates,
   Contractor/Files, Risk Review/Submit)
7. **Permits directory & detail page** — search/filter/paginate, status
   timeline, QR code, attachments, comment thread
8. **Approval workflow** — approval queue, signature capture, approve/reject
9. **Risk assessment module** — 5x5 likelihood/severity matrix, hazard
   scoring, control measures
10. **QR verification** — scanner + valid/invalid result screen
11. **Notifications, reporting/analytics, admin** (user management,
    role/permissions matrix, audit logs)
12. **Deployment** — hosted Postgres, env vars, Vercel production deploy

## Design tokens

Source of truth: `tailwind.config.ts`. Two intentional deviations from the
raw Stitch export, both fixes rather than reinterpretations:

- `rounded-full` is left at Tailwind's native `9999px` (the raw export had
  remapped it to `0.75rem`, which would have broken every perfectly round
  element such as avatars or circular icon buttons elsewhere in the app).
- Permit types/roles will be extended beyond what the mockups show (the
  mockups model 4 permit types and ~4 roles; the spec calls for 6 and 5
  respectively) — handled in the Prisma schema in Phase 1.
