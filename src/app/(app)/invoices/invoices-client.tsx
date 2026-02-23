"use client";

import { useState, useMemo } from "react";
import { InvoiceTable } from "@/components/invoice-table";
import {
  InvoiceFilterBar,
  type InvoiceFilters,
} from "@/components/invoice-filter-bar";
import { InvoiceDetailPanel } from "@/components/invoice-detail-panel";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

const emptyFilters: InvoiceFilters = {
  clientName: "",
  issueDateFrom: "",
  issueDateTo: "",
  totalMin: "",
  totalMax: "",
};

function applyFilters(invoices: Invoice[], filters: InvoiceFilters): Invoice[] {
  return invoices.filter((inv) => {
    if (
      filters.clientName &&
      !(inv.client_name ?? "")
        .toLowerCase()
        .includes(filters.clientName.toLowerCase())
    ) {
      return false;
    }
    if (filters.issueDateFrom && (inv.issue_date ?? "") < filters.issueDateFrom) {
      return false;
    }
    if (filters.issueDateTo && (inv.issue_date ?? "") > filters.issueDateTo) {
      return false;
    }
    if (filters.totalMin && (inv.total ?? 0) < Number(filters.totalMin)) {
      return false;
    }
    if (filters.totalMax && (inv.total ?? 0) > Number(filters.totalMax)) {
      return false;
    }
    return true;
  });
}

export function InvoicesClient({ invoices }: { invoices: Invoice[] }) {
  const [filters, setFilters] = useState<InvoiceFilters>(emptyFilters);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(
    () => applyFilters(invoices, filters),
    [invoices, filters]
  );

  return (
    <div className="flex flex-col gap-4">
      <InvoiceFilterBar filters={filters} onFiltersChange={setFilters} />
      <InvoiceTable
        invoices={filteredInvoices}
        onRowSelect={setSelectedInvoice}
      />
      <InvoiceDetailPanel
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
