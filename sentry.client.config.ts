import * as Sentry from "@sentry/nextjs";
import { getSentryBaseOptions } from "./sentry.shared.config";

Sentry.init({
  ...getSentryBaseOptions(),
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
});
