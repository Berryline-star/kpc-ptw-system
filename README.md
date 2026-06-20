# KPC Digital Permit-to-Work (PTW) System

Digital Permit-to-Work management and safety-compliance system for Kenya
Pipeline Company, built from the "Industrial Integrity System" design
(KPC Blue / Safety Orange, Inter typeface, Stitch-generated screens).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · PostgreSQL · Prisma
· Auth.js · React Context API · Vercel

## Status: Phase 6 — Permit creation wizard ✅

What's in this commit:

- **4-step wizard** (`src/components/permits/wizard/`) converted from
  the Stitch mockups — Type & Location → Details & Timeline → Contractor
  & Files → Hazard Assessment & Review. The 4 mockup files used
  inconsistent step labels; this build standardizes on **Type → Details
  → Hazards → Review** throughout.
- State lives in a **React Context** provider (`permit-wizard-context.tsx`,
  per your stated stack) so data persists across steps without prop
  drilling, plus per-step **Zod validation** (`src/lib/validation/permit.ts`)
  that blocks "Next" until that step's fields are valid.
- The wizard renders as a fixed full-screen overlay above the normal
  sidebar/topbar shell (matching the mockup's dedicated header), without
  needing a separate route-group restructure.
- **Server actions**: `getSupervisorOptions()` populates the Step 3
  supervisor dropdown from real `User` records; `createPermit()`
  (`src/lib/actions/permit.ts`) does the real work — atomically creates
  the `Permit`, its `RiskAssessment` + `Hazard` rows, a 2-stage
  `ApprovalStep` chain (Safety Officer → Depot Manager), and an initial
  `ActivityEntry`, then redirects to the new permit's detail page.
- A minimal **permit detail page** at `/permits/[id]` now exists so the
  post-submit redirect has somewhere real to land — shows the actual
  saved data (summary, risk assessment, approval chain). Gets replaced
  by the full mockup-matched detail page in Phase 7.
- **Known scope cut, called out deliberately**: Step 3's file upload UI
  is fully functional for local selection/preview/removal, but files
  aren't persisted to storage yet — that needs real file storage
  infrastructure (S3/Vercel Blob/etc.), which is Phase 7 work. Submitting
  a permit today saves everything except attached files.
- Verified by rendering all 4 steps with realistic data in a headless
  browser before shipping — caught and fixed one real bug in the process
  (the supervisor-lookup server action was using the redirect-throwing
  `requireUser()` inside a background `useEffect` call, which would have
  yanked users to `/login` if their session expired mid-wizard instead of
  failing gracefully).

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
6. ~~Permit creation wizard~~ done
7. **Permits directory & detail page** — search/filter/paginate, status
   timeline, QR code, attachments (real file storage), comment thread
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
