# KPC Digital Permit-to-Work (PTW) System

Digital Permit-to-Work management and safety-compliance system for Kenya
Pipeline Company, built from the "Industrial Integrity System" design
(KPC Blue / Safety Orange, Inter typeface, Stitch-generated screens).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · PostgreSQL · Prisma
· Auth.js · React Context API · Vercel

## Status: Phase 1 — Data layer ✅

What's in this commit:

- Full Prisma schema (`prisma/schema.prisma`): `User`, `RolePermission`,
  `Permit`, `RiskAssessment`, `Hazard`, `ControlMeasure`, `ApprovalStep`,
  `Attachment`, `ActivityEntry`, `Notification`, `AuditLog`,
  `PasswordResetToken` — covering all 6 permit types and 5 roles (System
  Admin, Safety Officer, Depot Manager, Contractor, Supervisor)
- Prisma Client singleton at `src/lib/prisma.ts` (hot-reload safe)
- Seed script (`prisma/seed.ts`) — 5 demo users (one per role, password
  `Password123!`), 4 demo permits across different statuses, default
  role/permission matrix
- Pinned to **Prisma 6.19.3** rather than the newly-released Prisma 7 —
  v7 requires ESM-only output, mandatory database driver adapters, and a
  new `prisma.config.ts` config system. None of that buys anything for
  this project and most existing tutorials/Stack Overflow answers still
  target v6, so v6 is the more practical choice here.

### Database setup (Neon — free tier)

1. Go to console.neon.tech, sign up, create a project (pick a region
   close to your deployment, e.g. AWS Frankfurt for East Africa).
2. On the project dashboard, copy the **pooled** connection string (the
   one with `-pooler` in the hostname) into `DATABASE_URL`, and the
   **direct** connection string (no `-pooler`) into `DIRECT_DATABASE_URL`
   in your local `.env` (copy `.env.example` to `.env` first — `.env` is
   git-ignored, so your credentials never get committed).
3. Run:
   ```bash
   npm run db:generate   # generates the Prisma Client
   npm run db:migrate    # creates tables from the schema (prompts for a migration name)
   npm run db:seed       # populates demo users + permits
   ```
4. Optional: `npm run db:studio` opens a GUI to browse your data.

### Run it

```bash
npm install
npm run dev
```

## Roadmap

1. ~~Foundations~~ done
2. ~~Data layer~~ done
3. **Auth** — Auth.js Credentials provider, role-aware sessions, route
   middleware, forgot/reset password
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
