import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// ─── Table ───────────────────────────────────────────────────────────────────

/** Mirrors the real table structure so the layout doesn't shift on load */
export function TableSkeleton({
  rows = 5,
  cols = 4,
  widths,
}: {
  rows?: number
  cols?: number
  /** Optional column width classes (e.g. 'w-20'). Falls back to sensible defaults. */
  widths?: string[]
}) {
  const w = (j: number) => widths?.[j] ?? (j === 0 ? 'w-24' : j === cols - 1 ? 'w-16' : 'w-28')

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: cols }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className={`h-4 ${w(i)}`} />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i} style={{ opacity: Math.max(0.2, 1 - i * 0.16) }}>
            {Array.from({ length: cols }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className={`h-4 ${w(j)}`} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────

export function CardStatSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  )
}

// ─── Announcement cards ───────────────────────────────────────────────────────

export function AnnouncementCardSkeleton({
  count = 4,
  showActions = false,
}: {
  count?: number
  showActions?: boolean
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ opacity: Math.max(0.2, 1 - i * 0.18) }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Title row + badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                {/* Content lines */}
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                {/* Date */}
                <Skeleton className="h-3 w-28" />
              </div>
              {showActions && (
                <div className="flex gap-1 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Member cards (grid) ─────────────────────────────────────────────────────

export function MemberCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ opacity: Math.max(0.2, 1 - i * 0.12) }}>
          <CardContent className="pt-4">
            {/* Name + badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            {/* Details */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Funeral case cards ───────────────────────────────────────────────────────

export function FuneralCaseCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ opacity: Math.max(0.2, 1 - i * 0.2) }}>
          <CardContent className="pt-5">
            {/* Name + badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {/* Grid details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Reports page ─────────────────────────────────────────────────────────────

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <CardStatSkeleton />
        <CardStatSkeleton />
        <CardStatSkeleton />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><Skeleton className="h-5 w-44" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full rounded-lg" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-44" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full rounded-lg" /></CardContent>
        </Card>
      </div>
    </div>
  )
}
