# Deploying to a real environment (Vercel)

This isn't a substitute for actually doing it — I can't deploy to your
Vercel account from here, no access to it. This is the checklist so
nothing gets missed, since the app now depends on several things beyond
what local dev needs.

## 1. Push to a Git repo Vercel can see

If this isn't already on GitHub/GitLab/Bitbucket, get it there first —
Vercel deploys from a connected repo, not a local folder upload, for
anything beyond a one-off preview.

## 2. Import the project into Vercel

vercel.com → Add New → Project → import the repo. Vercel auto-detects
Next.js, no config needed for the build itself.

## 3. Set every environment variable

Project Settings → Environment Variables. Everything in `.env.example`
needs a real value here — this list is authoritative as of this change,
cross-check against `.env.example` if it drifts:

| Variable | Where it comes from | Notes |
|---|---|---|
| `DATABASE_URL` | Neon dashboard, pooled connection string | Has `-pooler` in the hostname |
| `DIRECT_DATABASE_URL` | Neon dashboard, direct connection string | No `-pooler` — only used by `prisma migrate` |
| `AUTH_SECRET` | Generate fresh, don't reuse your local dev one | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXT_PUBLIC_APP_URL` | Your real production URL | e.g. `https://ptw.kpc.co.ke`, not localhost |
| `BLOB_READ_WRITE_TOKEN` | Vercel Storage tab → create a Blob store | Auto-added by Vercel if you create the store from the dashboard |
| `CRON_SECRET` | Generate fresh | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` — without this, the daily permit-expiry/activation job silently 401s forever |
| `RESEND_API_KEY` | resend.com dashboard | See below re: domain verification |
| `EMAIL_FROM` | Your verified domain, once set up | Falls back to Resend's shared test address otherwise — see below |
| `SEED_PASSWORD` | **Set this before seeding** | The seed script now refuses to run in production without it — see step 6 |
| `NEXT_PUBLIC_SENTRY_DSN` | sentry.io → Settings → Client Keys | Error monitoring — optional but recommended before real users depend on this |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | sentry.io dashboard | Only needed for source-map upload during build; skip if not using Sentry |

**Do not reuse your local `.env` values wholesale** — `AUTH_SECRET` and
`CRON_SECRET` especially should be freshly generated for production, not
copied from dev.

## 4. Verify your email sending domain (before relying on it for real)

`onboarding@resend.dev` (the default) only delivers to the email you
signed up to Resend with — fine for testing, not for real users. In
Resend's dashboard: Domains → Add Domain → add the DNS records they
give you to your domain registrar → wait for verification (usually
minutes, sometimes longer depending on DNS propagation). Then update
`EMAIL_FROM` to something like `KPC Digital PtW <noreply@kpc.co.ke>`.

## 5. Run the database migrations against production

From your local machine, pointed at the **production** `DATABASE_URL`
(temporarily set it in your local `.env`, or run this from a one-off
Vercel deploy hook — either works):

```bash
npx prisma migrate deploy
```

Use `migrate deploy`, not `migrate dev` — `deploy` just applies existing
migration files without prompting or trying to generate new ones,
which is what you want against a real database you don't want Prisma
improvising against.

## 6. Seed production — carefully

```bash
SEED_PASSWORD=something-real-and-unique npx prisma db seed
```

This creates the 6 baseline accounts (including `demo@kpc.co.ke`) with
whatever password you pass here, not the dev default. **Write this
password down somewhere safe** — you'll need it to log in as any of
these accounts the first time, including the System Admin one you'll
use to invite everyone else's real accounts.

## 7. Set up the cron job

`vercel.json` already declares the schedule (daily). Once `CRON_SECRET`
is set (step 3) and the project is deployed, Vercel starts calling it
automatically — nothing else to configure. Verify it's registered:
Project → Cron Jobs tab in the Vercel dashboard.

## 8. Get Privacy Policy and Terms of Service reviewed

`/privacy` and `/terms` are structured drafts covering what the system
actually does technically — not vetted legal advice. Every
`[bracketed]` placeholder needs a real value, and the whole thing needs
review by counsel familiar with Kenya's Data Protection Act, 2019
before this handles real employee/contractor data. Don't skip this —
it's not optional once real personal data is involved.

## 9. First real login and immediate cleanup

1. Log in as `admin@kpc.co.ke` with your `SEED_PASSWORD` value
2. Go to Administration → User Management → **Invite** real people with
   their real emails, real roles
3. Once real admins exist and can log in: consider deactivating or
   deleting the seeded demo accounts (`safety.officer@kpc.co.ke`,
   `contractor@kpc.co.ke`, etc.) if they're not meant to be real
   accounts in this environment — they're currently indistinguishable
   from real accounts once seeded, just with a well-known password
4. Test the "Launch Demo" flow explicitly — confirm it correctly blocks
   real permit creation (see the demo-account fix from earlier)

## 10. Smoke test before calling it done

- [ ] Log in / log out works
- [ ] Submit a permit as Contractor → Safety Officer gets a notification
- [ ] Approve it → Depot Manager gets notified for the next step
- [ ] `/reports` shows real numbers, not zeros
- [ ] `/admin/roles` toggle → `/assets` visibility actually changes for that role
- [ ] Password reset email actually arrives
- [ ] Invite a user → they receive the email → they can set a password → they can log in
- [ ] `curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/permit-expiry` returns `{"success":true,...}`
- [ ] If Sentry is configured: trigger a deliberate error and confirm it shows up in the Sentry dashboard within a minute or two
- [ ] `/privacy` and `/terms` render, and the footer links to them actually work
