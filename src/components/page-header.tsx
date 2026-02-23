import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-1 pb-4",
        className
      )}
    >
      {breadcrumbs}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
