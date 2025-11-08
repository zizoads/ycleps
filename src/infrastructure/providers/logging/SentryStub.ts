
// This is a stub for the Sentry logging service.
// In a real application, you would import and use the actual @sentry/react package.

export class SentryStub {
  private dsn: string | undefined;

  constructor(dsn?: string) {
    this.dsn = dsn;
    if (this.dsn) {
      console.log('SentryStub initialized.');
    } else {
      console.log('SentryStub initialized without DSN. Errors will be logged to console only.');
    }
  }

  public captureException(error: any, context?: Record<string, any>): void {
    console.error('[SentryStub] Captured Exception:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    });
    // If DSN was provided, you would send the event to Sentry here.
    // Eg: Sentry.captureException(error, { extra: context });
  }

  public captureMessage(message: string, context?: Record<string, any>): void {
    console.log('[SentryStub] Captured Message:', {
      message,
      context,
    });
    // Eg: Sentry.captureMessage(message, { extra: context });
  }
}
