# KPC Digital Permit-to-Work (PTW) System

Digital Permit-to-Work management and safety-compliance system for Kenya
Pipeline Company, built from the "Industrial Integrity System" design
(KPC Blue / Safety Orange, Inter typeface, Stitch-generated screens).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · PostgreSQL · Prisma
· Auth.js · React Context API · Vercel

## Status: Phase 5 — Operations dashboard ✅

What's in this commit:

- `src/lib/queries/dashboard.ts` — server-side query module computing
  every dashboard number from real Prisma data: permit counts by status,
  permit type distribution (donut chart percentages), risk level
  breakdown, a 7-day creation trend, the 6 most recent activity-log
  entries, and dynamically generated alerts (e.g. only shows an "expiring
  soon" alert if a permit is actually expiring within the hour).
- Stat cards, permit trend bar chart, permit type donut chart, risk
  category bars, recent activity feed, alerts panel, "Ready to Issue?"
  quick-action card, and the floating action button — all converted from
  the Stitch `operations_dashboard` mockup into real components in
  `src/components/dashboard/`, each taking typed data as props rather
  than hardcoded values.
- The donut chart's arc math (`stroke-dasharray`/`stroke-dashoffset`) is
  computed from real percentages, not copy-pasted from the mockup — it'll
  correctly redraw itself as your real permit-type mix changes.
- Verified by rendering the dashboard with realistic mock data in a
  headless browser at both desktop and mobile widths before shipping —
  confirmed the bento grid, chart proportions, and FAB placement all hold
  up against the actual mockup.

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
5. ~~Operations dashboard~~ done
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
