import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        // TODO(phase1): swap the Stitch placeholder hero image for a real,
        // owned asset in /public and drop this remote pattern.
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only actually uploads source maps / creates a release when this is
  // set (needs a real Sentry auth token) — without it, this wrapper is
  // a safe no-op and the build behaves exactly as it did before Sentry
  // was added.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  // We're not using Vercel Cron's log drain feature or Sentry's tunnel
  // route — keep the setup minimal rather than opting into every
  // optional Sentry feature by default.
  automaticVercelMonitors: false,
});
