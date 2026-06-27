import * as Sentry from "@sentry/nextjs";
import { getSentryBaseOptions } from "./sentry.shared.config";

Sentry.init(getSentryBaseOptions());
