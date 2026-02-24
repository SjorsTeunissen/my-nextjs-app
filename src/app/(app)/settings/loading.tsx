import { Skeleton } from "@/components/ui/skeleton";

function SidebarSkeleton() {
  return (
    <div className="w-48 shrink-0 space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full animate-pulse rounded-md" />
      ))}
    </div>
  );
}

function CardFieldSkeleton({ fieldCount = 1 }: { fieldCount?: number }) {
  return (
    <div className="rounded-md border py-4 shadow-[0_1px_2px_0_oklch(0_0_0/0.04)]">
      <div className="px-4 pb-4">
        <Skeleton className="h-4 w-32 animate-pulse" />
      </div>
      <div className="space-y-3 px-4">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 animate-pulse" />
            <Skeleton className="h-9 w-full animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <>
      <header className="flex items-center justify-between pb-4">
        <Skeleton className="h-7 w-20 animate-pulse" />
      </header>

      <div className="flex gap-6">
        <SidebarSkeleton />
        <div className="min-w-0 flex-1">
          <CardFieldSkeleton fieldCount={1} />
          <div className="mt-4">
            <Skeleton className="h-9 w-28 animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}
