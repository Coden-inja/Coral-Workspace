"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void error;
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
          <section className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.08em] text-zinc-400">Operational Resilience</p>
            <h1 className="mt-2 text-lg font-semibold text-zinc-100">Unexpected application fault</h1>
            <p className="mt-2 text-sm text-zinc-300">
              CoralTeams recovered into a safe state boundary. You can retry the last render without losing route context.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Retry render
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
