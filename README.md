# KPC Digital Permit-to-Work (PTW) System

Digital Permit-to-Work management and safety-compliance system for Kenya
Pipeline Company, built from the "Industrial Integrity System" design
(KPC Blue / Safety Orange, Inter typeface, Stitch-generated screens).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · PostgreSQL · Prisma
· Auth.js · React Context API · Vercel

## Status: Phase 0 — Foundations ✅

What's in this commit:

- Next.js 15 + TypeScript + App Router scaffold
- Tailwind CSS v3, configured with the full KPC design-token set
  (`tailwind.config.ts`) ported from `DESIGN.md` — colors, type scale,
  spacing rhythm, and corner radii all match the Stitch mockups exactly,
  so markup copied from a Stitch screen drops in without modification
- Inter loaded via `next/font/google`; Material Symbols icon font linked
  in the root layout
- `cn()` classname-merging utility (`clsx` + `tailwind-merge`)
- Folder skeleton: `src/components/ui`, `src/components/layout`,
  `src/lib`, `src/types`
- A token-check placeholder at `/` — confirms colors/type/spacing/radius
  render correctly (delete once the real landing page lands)

### Run it

```bash
npm install
npm run dev
```

## Roadmap

1. ~~Foundations~~ done
2. **Data layer** — Prisma schema (User/Role, Permit, RiskAssessment,
   ApprovalStep, Attachment, ActivityLog, Notification, AuditLog), migrate
   + seed
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
