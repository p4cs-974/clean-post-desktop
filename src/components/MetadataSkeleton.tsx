export function MetadataSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 animate-pulse">
      <div className="flex items-center gap-3">
        {/* Icon placeholder */}
        <div className="h-9 w-9 rounded-full bg-muted" />

        {/* Text placeholders */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>

        {/* Badge placeholders */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="h-5 w-14 rounded-full bg-muted" />
          <div className="h-5 w-14 rounded-full bg-muted" />
        </div>

        {/* Chevron placeholder */}
        <div className="h-4 w-4 rounded bg-muted" />
      </div>
    </div>
  )
}
