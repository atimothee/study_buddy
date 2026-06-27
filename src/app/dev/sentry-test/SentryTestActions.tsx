"use client";

import * as Sentry from "@sentry/nextjs";
import { captureAppError } from "@/lib/sentry";

export function SentryTestActions() {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="rounded-lg border border-slate-300 px-4 py-2 text-left text-sm hover:bg-slate-50"
        onClick={() => {
          captureAppError(new Error("StudyBuddy Sentry test exception"), {
            feature: "study_generation",
            extra: { sourceLengthBucket: "100-499", test: true },
          });
        }}
      >
        Capture test exception
      </button>
      <button
        type="button"
        className="rounded-lg border border-red-300 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
        onClick={() => {
          throw new Error("StudyBuddy Sentry uncaught client error");
        }}
      >
        Throw uncaught client error
      </button>
      <button
        type="button"
        className="rounded-lg border border-slate-300 px-4 py-2 text-left text-sm hover:bg-slate-50"
        onClick={() => {
          Sentry.startSpan({ name: "sentry-test-span", op: "test" }, () => {
            Sentry.captureMessage("StudyBuddy Sentry test message");
          });
        }}
      >
        Send test message with span
      </button>
    </div>
  );
}
