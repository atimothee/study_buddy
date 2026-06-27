import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
};

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default withSentryConfig(withEve(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: sentryAuthToken,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !sentryAuthToken,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
