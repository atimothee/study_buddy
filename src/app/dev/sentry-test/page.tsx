import { notFound } from "next/navigation";
import { SentryTestActions } from "./SentryTestActions";

export default function SentryTestPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sentry test</h1>
        <p className="mt-2 text-sm text-slate-600">
          Development-only route for verifying Sentry error capture and tracing.
        </p>
      </div>
      <SentryTestActions />
    </main>
  );
}
