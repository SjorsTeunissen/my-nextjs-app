"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { InvoicePdf } from "@/components/invoice-pdf";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];
type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];

interface PdfDownloadButtonProps {
  invoice: Invoice;
  lineItems: LineItem[];
  companySettings: CompanySettings;
}

export function PdfDownloadButton({
  invoice,
  lineItems,
  companySettings,
}: PdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <InvoicePdf
          invoice={invoice}
          lineItems={lineItems}
          companySettings={companySettings}
        />
      }
      fileName={`invoice-${invoice.invoice_number}.pdf`}
    >
      {({ loading }) => (
        <Button type="button" variant="outline" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
