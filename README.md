# KPC Digital Permit-to-Work (PTW) System

Digital Permit-to-Work management and safety-compliance system for Kenya
Pipeline Company, built from the "Industrial Integrity System" design
(KPC Blue / Safety Orange, Inter typeface, Stitch-generated screens).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · PostgreSQL · Prisma
· Auth.js · React Context API · Vercel

## Status: Phase 2 — Auth ✅

What's in this commit:

- **Auth.js v5** (`next-auth@beta` — still officially beta-tagged even now,
  but it's the standard App-Router-native way to do this and what the spec
  asks for) with a Credentials provider checking email/password against
  the `User` table (bcrypt-compared)
- Split config: `src/auth.config.ts` (edge-safe — used by `middleware.ts`)
  vs `src/auth.ts` (Node-only, holds the bcrypt/Prisma-dependent
  `authorize` logic). Keeps the Edge middleware bundle free of anything
  that can't run there.
- `middleware.ts` redirects unauthenticated users away from `/dashboard`
  and signed-in users away from `/login` — but per current best practice
  (Next.js middleware has had real bypass vulnerabilities, e.g.
  CVE-2025-29927) this is treated as a UX layer, not the security
  boundary: `src/lib/session.ts`'s `requireUser()`/`requireRole()` re-check
  the session directly in every protected Server Component/Action too.
- Role + id injected into the JWT/session via callbacks, typed through
  `src/types/next-auth.d.ts`
- Login, forgot-password, and reset-password pages — converted from the
  matching Stitch screens, wired to real server actions
  (`src/lib/actions/auth.ts`, `src/lib/actions/password-reset.ts`).
  Password reset issues a real token (`PasswordResetToken` table, 30 min
  expiry) and logs the reset link to the server console — there's no
  email provider wired up yet, so this is the placeholder until one is
  added.
- `/dashboard` — a bare placeholder that proves the full loop
  (login → session → protected route → role visible → logout). Gets
  replaced by the real Operations Dashboard in Phase 4.

### Previously, Phase 1 — Data layer

Full Prisma schema (`prisma/schema.prisma`): `User`, `RolePermission`,
`Permit`, `RiskAssessment`, `Hazard`, `ControlMeasure`, `ApprovalStep`,
`Attachment`, `ActivityEntry`, `Notification`, `AuditLog`,
`PasswordResetToken` — covering all 6 permit types and 5 roles (System
Admin, Safety Officer, Depot Manager, Contractor, Supervisor). Seed script
(`prisma/seed.ts`) creates 5 demo users (one per role, password
`Password123!`) and 4 demo permits. Pinned to **Prisma 6.19.3** rather
than the newly-released Prisma 7 — v7 requires ESM-only output, mandatory
database driver adapters, and a new `prisma.config.ts` config system.
None of that buys anything here, and most existing tutorials/Stack
Overflow answers still target v6.

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
4. **App shell** — sidebar (desktop) / bottom tab bar (mobile), role-aware
   nav
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
