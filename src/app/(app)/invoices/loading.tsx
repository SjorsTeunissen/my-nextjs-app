import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceTableSkeleton } from "@/components/invoice-table-skeleton";

export default function InvoicesLoading() {
  return (
    <>
      <header className="flex items-center justify-between pb-4">
        <Skeleton className="h-7 w-24 animate-pulse" />
        <Skeleton className="h-8 w-28 animate-pulse rounded-md" />
      </header>
      <InvoiceTableSkeleton />
    </>
  );
}
