export function AuthRouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800/90 bg-zinc-900/70 px-4 py-5 text-center shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_10px_24px_rgba(2,6,23,0.35)]">
        <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">CoralTeams</p>
        <p className="mt-2 text-sm font-medium text-zinc-200">Restoring session...</p>
        <div className="mx-auto mt-4 h-1 w-24 overflow-hidden rounded bg-zinc-800">
          <div className="h-full w-1/2 animate-pulse rounded bg-blue-500/70" />
        </div>
      </div>
    </div>
  );
}
