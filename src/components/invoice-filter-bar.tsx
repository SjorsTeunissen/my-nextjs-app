"use client";

import { useCallback, useRef } from "react";
import { X, User, Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export interface InvoiceFilters {
  clientName: string;
  issueDateFrom: string;
  issueDateTo: string;
  totalMin: string;
  totalMax: string;
}

interface InvoiceFilterBarProps {
  filters: InvoiceFilters;
  onFiltersChange: (filters: InvoiceFilters) => void;
}

function DebouncedInput({
  value,
  onChange,
  delay = 300,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(val);
      }, delay);
    },
    [onChange, delay]
  );

  return <Input ref={inputRef} key={value} defaultValue={value} onChange={handleChange} {...props} />;
}

export function InvoiceFilterBar({
  filters,
  onFiltersChange,
}: InvoiceFilterBarProps) {
  const activeFilters: { key: keyof InvoiceFilters; label: string }[] = [];
  if (filters.clientName)
    activeFilters.push({ key: "clientName", label: `Client: ${filters.clientName}` });
  if (filters.issueDateFrom)
    activeFilters.push({ key: "issueDateFrom", label: `From: ${filters.issueDateFrom}` });
  if (filters.issueDateTo)
    activeFilters.push({ key: "issueDateTo", label: `To: ${filters.issueDateTo}` });
  if (filters.totalMin)
    activeFilters.push({ key: "totalMin", label: `Min: ${filters.totalMin}` });
  if (filters.totalMax)
    activeFilters.push({ key: "totalMax", label: `Max: ${filters.totalMax}` });

  const hasActiveFilters = activeFilters.length > 0;
  const hasClientFilter = !!filters.clientName;
  const hasDateFilter = !!filters.issueDateFrom || !!filters.issueDateTo;
  const hasAmountFilter = !!filters.totalMin || !!filters.totalMax;

  function removeFilter(key: keyof InvoiceFilters) {
    onFiltersChange({ ...filters, [key]: "" });
  }

  function clearAll() {
    onFiltersChange({
      clientName: "",
      issueDateFrom: "",
      issueDateTo: "",
      totalMin: "",
      totalMax: "",
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <User className="size-3.5" />
              Client
              {hasClientFilter && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3">
            <DebouncedInput
              placeholder="Client name..."
              value={filters.clientName}
              onChange={(val) => onFiltersChange({ ...filters, clientName: val })}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Calendar className="size-3.5" />
              Date
              {hasDateFilter && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3">
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                aria-label="From date"
                value={filters.issueDateFrom}
                onChange={(e) =>
                  onFiltersChange({ ...filters, issueDateFrom: e.target.value })
                }
              />
              <Input
                type="date"
                aria-label="To date"
                value={filters.issueDateTo}
                onChange={(e) =>
                  onFiltersChange({ ...filters, issueDateTo: e.target.value })
                }
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <DollarSign className="size-3.5" />
              Amount
              {hasAmountFilter && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.totalMin}
                onChange={(e) =>
                  onFiltersChange({ ...filters, totalMin: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.totalMax}
                onChange={(e) =>
                  onFiltersChange({ ...filters, totalMax: e.target.value })
                }
              />
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1 rounded-full">
              {filter.label}
              <button
                type="button"
                aria-label="Remove filter"
                onClick={() => removeFilter(filter.key)}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
