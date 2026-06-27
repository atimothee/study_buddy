const isDev = process.env.NODE_ENV === "development";

export function getSentryEnvironment(): string {
  return process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
}

export function getTracesSampleRate(): number {
  return isDev ? 1.0 : 0.1;
}

export function getSentryDsn(): string | undefined {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function getSentryBaseOptions() {
  return {
    dsn: getSentryDsn(),
    environment: getSentryEnvironment(),
    tracesSampleRate: getTracesSampleRate(),
    sendDefaultPii: false,
    debug: isDev && Boolean(process.env.SENTRY_DEBUG),
  };
}
