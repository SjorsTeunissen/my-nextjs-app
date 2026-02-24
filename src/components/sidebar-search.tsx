"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchInvoices } from "@/app/(app)/invoices/actions";
import { formatCurrency } from "@/lib/utils";

interface SearchResult {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
}

export function SidebarSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    const data = await searchInvoices(searchQuery);
    setResults(data);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("");
      setResults([]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push("/invoices");
    setQuery("");
    setResults([]);
  };

  return (
    <div className="px-3 py-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          aria-label="Search invoices"
          placeholder="Search invoices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 pl-8 text-xs bg-[oklch(0.975_0.004_85)] dark:bg-[oklch(0.14_0.008_260)] border-input"
        />
      </div>
      {results.length > 0 && (
        <ul className="mt-1 space-y-0.5 rounded-md border border-border bg-popover p-1 shadow-[0_2px_8px_0_oklch(0_0_0/0.06)]">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => handleResultClick(result)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{result.invoice_number}</span>
                  <span className="text-muted-foreground">{result.client_name}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{formatCurrency(result.total)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
