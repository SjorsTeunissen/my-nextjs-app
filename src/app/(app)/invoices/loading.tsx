import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceTableSkeleton } from "@/components/invoice-table-skeleton";

export default function InvoicesLoading() {
  return (
    <>
      <header className="flex items-center justify-between pb-4">
        <Skeleton className="h-7 w-24 animate-pulse" />
        <Skeleton className="h-8 w-28 animate-pulse rounded-sm" />
      </header>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-16 animate-pulse rounded-sm" />
          <Skeleton className="h-7 w-14 animate-pulse rounded-sm" />
          <Skeleton className="h-7 w-20 animate-pulse rounded-sm" />
        </div>
        <InvoiceTableSkeleton />
      </div>
    </>
  );
}
