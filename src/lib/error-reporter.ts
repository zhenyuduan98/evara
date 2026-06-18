interface ErrorContext {
  userId?: string;
  route?: string;
  action?: string;
  [key: string]: unknown;
}

export function captureException(error: unknown, context?: ErrorContext): void {
  const timestamp = new Date().toISOString();
  const sentryDsn = process.env.SENTRY_DSN;

  const errorInfo = {
    timestamp,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  if (sentryDsn) {
    // In production with Sentry configured, would send via Sentry SDK:
    // Sentry.captureException(error, { extra: context });
    console.error('[Sentry] Would send to:', sentryDsn, errorInfo);
  } else {
    console.error(JSON.stringify(errorInfo, null, 2));
  }
}
