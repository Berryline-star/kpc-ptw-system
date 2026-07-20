import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Without a DSN set, Sentry's SDK just no-ops silently rather than
  // throwing — safe to leave unset in local dev.
  tracesSampleRate: 0.1,
  // Session replay is off by default — turning it on means recording
  // what users actually did on screen, which is a real privacy
  // decision (this system handles employee/contractor data) that
  // shouldn't be made implicitly by copying a starter config.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  debug: false,
});
