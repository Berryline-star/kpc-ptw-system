# KPC Digital Permit-to-Work (PTW) System

Digital Permit-to-Work management and safety-compliance system for Kenya
Pipeline Company, built from the "Industrial Integrity System" design
(KPC Blue / Safety Orange, Inter typeface, Stitch-generated screens).

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v3 · PostgreSQL · Prisma
· Auth.js · React Context API · Vercel

## Status: Phase 8 — Approval workflow ✅

What's in this commit:

- **Approval queue** (`/approvals`) — shows permits genuinely waiting on
  the signed-in user's role specifically, not just any pending permit.
  Enforces approval-chain order: a Depot Manager never sees a permit the
  Safety Officer hasn't approved yet, even though both are "pending"
  permits in the database.
- **Approval action page** (`/approvals/[stepId]`) — converted from the
  Stitch mockup: permit summary, risk assessment with hazard/PPE tags, a
  live approval-timeline showing who's approved and when, a review-notes
  textarea, a click-to-sign digital signature pad (cursive name reveal,
  matching the mockup's interaction), and Approve/Reject actions.
- **Server actions** (`src/lib/actions/approvals.ts`) — `approvePermitStep()`
  and `rejectPermitStep()` both re-check authorization and sequence order
  server-side (not just trusting the queue query), so a direct action
  call can't skip ahead or action a step that isn't actually assigned to
  that role. Approving the *final* step in the chain promotes the whole
  permit to `APPROVED`; rejecting at any step immediately sets the permit
  to `REJECTED`. Both log an `ActivityEntry` so the permit detail page's
  comment thread shows the approval/rejection automatically.
- Rejecting requires a reason (minimum 5 characters); approving requires
  the signature pad to be "signed" first — both enforced both client-side
  (for instant feedback) and server-side (the actual rule).
- A genuine type-safety improvement worth noting: the first version of
  the authorization helper returned a loosely-typed object that TypeScript
  couldn't reliably narrow, which silently produced an invalid-looking
  error type. Rewrote it as a proper discriminated union keyed on a
  `success: boolean` field — a cleaner pattern than what earlier phases
  used, worth carrying forward into later server actions too.

### Setup from scratch

What's in this commit:

- **Permits directory** (`/permits`) — bento stat cards (total/pending/
  active, computed independently of the active filter), a debounced
  search box (matches on permit number, description, or facility name),
  permit cards color-coded by type and status, and pagination. Search
  updates the URL's query string and resets to page 1 on a new term, so
  the list is fully shareable/bookmarkable and survives a refresh.
- **Permit detail page** (`/permits/[id]`) — converted from the Stitch
  mockup: work type/location/validity cards, a status banner, hazard
  cards, a signatories list showing real approval-chain progress, a real
  attachments list with working download links, and a live activity-log
  thread (chat-style comments + system-update entries) that lets any
  signed-in user post a new comment.
- **Real file storage** — Step 3 of the wizard now actually persists
  uploaded files via **Vercel Blob** (`src/lib/actions/attachments.ts`):
  size/MIME-type validated, authorization-checked (only the creator,
  assigned supervisor, Safety Officer, or System Admin can attach files),
  and gracefully degrades with a clear message rather than crashing if
  `BLOB_READ_WRITE_TOKEN` isn't configured yet.
- **Real bug found and fixed during this phase**: the Tailwind `content`
  config only scanned `src/app` and `src/components`, silently missing
  `src/lib` — which meant any status/type badge color built from a
  lookup table in `src/lib/config/permit-display.ts` (e.g. the "Pending"
  pill) lost its background color entirely and rendered as plain text.
  Fixed by adding `src/lib/**/*.{ts,tsx}` to the content glob; verified
  by re-rendering both the list and detail pages and visually confirming
  every status pill now shows its correct color.

### New environment variable this phase

Add to your `.env` (see `.env.example` for the full template):
```
BLOB_READ_WRITE_TOKEN=
```
Get this by creating a Blob store from your Vercel dashboard's Storage
tab — for a Vercel-deployed project this env var is added automatically;
for local dev, copy the same token value from that same dashboard page.
File uploads simply won't work without it (with a clear in-app error
message), but everything else in the app functions normally either way.

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
7. ~~Permits directory & detail page~~ done
8. ~~Approval workflow~~ done
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
