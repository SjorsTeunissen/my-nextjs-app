import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton({ fieldCount = 1 }: { fieldCount?: number }) {
  return (
    <section>
      <Skeleton className="h-4 w-32 animate-pulse" />
      <div className="bg-border my-2 h-px w-full" />
      <div className="space-y-3">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 animate-pulse" />
            <Skeleton className="h-9 w-full animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

function GridSectionSkeleton({
  columns,
}: {
  columns: number;
}) {
  return (
    <div
      className={`grid gap-3 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3.5 w-24 animate-pulse" />
          <Skeleton className="h-9 w-full animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <>
      <header className="flex items-center justify-between pb-4">
        <Skeleton className="h-7 w-20 animate-pulse" />
      </header>

      <div className="space-y-6">
        {/* Company Information */}
        <SectionSkeleton fieldCount={1} />

        {/* Address */}
        <section>
          <Skeleton className="h-4 w-32 animate-pulse" />
          <div className="bg-border my-2 h-px w-full" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 animate-pulse" />
              <Skeleton className="h-9 w-full animate-pulse rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 animate-pulse" />
              <Skeleton className="h-9 w-full animate-pulse rounded-md" />
            </div>
            <GridSectionSkeleton columns={3} />
          </div>
        </section>

        {/* Contact */}
        <section>
          <Skeleton className="h-4 w-32 animate-pulse" />
          <div className="bg-border my-2 h-px w-full" />
          <div className="space-y-3">
            <GridSectionSkeleton columns={2} />
          </div>
        </section>

        {/* Banking */}
        <section>
          <Skeleton className="h-4 w-32 animate-pulse" />
          <div className="bg-border my-2 h-px w-full" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 animate-pulse" />
              <Skeleton className="h-9 w-full animate-pulse rounded-md" />
            </div>
            <GridSectionSkeleton columns={2} />
          </div>
        </section>

        {/* Tax */}
        <section>
          <Skeleton className="h-4 w-32 animate-pulse" />
          <div className="bg-border my-2 h-px w-full" />
          <div className="space-y-3">
            <GridSectionSkeleton columns={2} />
          </div>
        </section>

        {/* Save button skeleton */}
        <Skeleton className="h-9 w-28 animate-pulse rounded-md" />
      </div>

      {/* Logo section */}
      <div className="mt-6 space-y-3">
        <Skeleton className="h-4 w-16 animate-pulse" />
        <div className="bg-border my-2 h-px w-full" />
        <Skeleton className="size-24 animate-pulse rounded-md" />
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 animate-pulse" />
            <Skeleton className="h-9 w-48 animate-pulse rounded-md" />
          </div>
          <Skeleton className="h-9 w-20 animate-pulse rounded-md" />
        </div>
      </div>
    </>
  );
}
