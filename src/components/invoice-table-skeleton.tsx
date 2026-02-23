import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">
            <Skeleton className="h-4 w-20 animate-pulse" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-4 w-24 animate-pulse" />
          </TableHead>
          <TableHead className="w-[100px]">
            <Skeleton className="h-4 w-16 animate-pulse" />
          </TableHead>
          <TableHead className="w-[100px]">
            <Skeleton className="h-4 w-16 animate-pulse" />
          </TableHead>
          <TableHead className="w-[100px] text-right">
            <Skeleton className="ml-auto h-4 w-12 animate-pulse" />
          </TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-16 animate-pulse" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32 animate-pulse" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20 animate-pulse" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20 animate-pulse" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="ml-auto h-4 w-16 animate-pulse" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-8 animate-pulse" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
