"use client";

import dynamic from "next/dynamic";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];
type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];

const PdfDownloadButton = dynamic(
  () =>
    import("@/components/pdf-download-button").then((mod) => ({
      default: mod.PdfDownloadButton,
    })),
  { ssr: false }
);

interface PdfDownloadButtonWrapperProps {
  invoice: Invoice;
  lineItems: LineItem[];
  companySettings: CompanySettings;
}

export function PdfDownloadButtonWrapper({
  invoice,
  lineItems,
  companySettings,
}: PdfDownloadButtonWrapperProps) {
  return (
    <PdfDownloadButton
      invoice={invoice}
      lineItems={lineItems}
      companySettings={companySettings}
    />
  );
}
