// Temporarily disabled Sentry due to OpenTelemetry platform detection issues on Windows
// import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Temporarily disabled Sentry
  // if (process.env.NEXT_RUNTIME === "nodejs") {
  //   await import("../sentry.server.config");
  // }

  // if (process.env.NEXT_RUNTIME === "edge") {
  //   await import("../sentry.edge.config");
  // }
}

// export const onRequestError = Sentry.captureRequestError;
