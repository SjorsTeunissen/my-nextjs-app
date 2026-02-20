"use client";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];
type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];

interface InvoicePdfProps {
  invoice: Invoice;
  lineItems: LineItem[];
  companySettings: CompanySettings;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  companyBlock: {
    flexDirection: "column",
    maxWidth: "50%",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
    objectFit: "contain",
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  clientBlock: {
    flexDirection: "column",
    alignItems: "flex-end",
    maxWidth: "45%",
  },
  clientLabel: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  metaItem: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: "right",
  },
  colUnitPrice: {
    flex: 1.5,
    textAlign: "right",
  },
  colAmount: {
    flex: 1.5,
    textAlign: "right",
  },
  headerText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    textTransform: "uppercase",
  },
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
    paddingVertical: 4,
  },
  totalsLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    color: "#666666",
  },
  totalsValue: {
    width: 100,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 200,
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: "#111827",
    marginTop: 4,
  },
  totalLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  bankSection: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  bankTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  bankRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bankLabel: {
    width: 50,
    color: "#666666",
  },
  bankValue: {},
  textSmall: {
    fontSize: 9,
    color: "#374151",
  },
});

export function InvoicePdf({
  invoice,
  lineItems,
  companySettings,
}: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header: Company + Client */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            {companySettings.logo_url && (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image does not render alt text
              <Image src={companySettings.logo_url} style={styles.logo} />
            )}
            <Text style={styles.companyName}>
              {companySettings.company_name}
            </Text>
            {companySettings.address_line1 && (
              <Text style={styles.textSmall}>
                {companySettings.address_line1}
              </Text>
            )}
            {companySettings.address_line2 && (
              <Text style={styles.textSmall}>
                {companySettings.address_line2}
              </Text>
            )}
            {(companySettings.postal_code || companySettings.city) && (
              <Text style={styles.textSmall}>
                {[companySettings.postal_code, companySettings.city]
                  .filter(Boolean)
                  .join(" ")}
              </Text>
            )}
            {companySettings.country && (
              <Text style={styles.textSmall}>{companySettings.country}</Text>
            )}
          </View>

          <View style={styles.clientBlock}>
            <Text style={styles.clientLabel}>BILL TO</Text>
            <Text style={styles.clientName}>{invoice.client_name}</Text>
            {invoice.client_address && (
              <Text style={styles.textSmall}>{invoice.client_address}</Text>
            )}
            {(invoice.client_postal_code || invoice.client_city) && (
              <Text style={styles.textSmall}>
                {[invoice.client_postal_code, invoice.client_city]
                  .filter(Boolean)
                  .join(" ")}
              </Text>
            )}
            {invoice.client_country && (
              <Text style={styles.textSmall}>{invoice.client_country}</Text>
            )}
          </View>
        </View>

        {/* Invoice Metadata */}
        <View style={styles.metaSection}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>INVOICE NUMBER</Text>
            <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>ISSUE DATE</Text>
            <Text style={styles.metaValue}>{invoice.issue_date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>DUE DATE</Text>
            <Text style={styles.metaValue}>
              {invoice.due_date ?? "-"}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colUnitPrice]}>
              Unit Price
            </Text>
            <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
          </View>
          {lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDescription}>
                {item.description}
              </Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnitPrice}>
                {formatCurrency(item.unit_price ?? 0)}
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.amount ?? 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>
              {formatCurrency(invoice.subtotal ?? 0)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              Tax ({invoice.tax_rate ?? 0}%)
            </Text>
            <Text style={styles.totalsValue}>
              {formatCurrency(invoice.tax_amount ?? 0)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.total ?? 0)}
            </Text>
          </View>
        </View>

        {/* Bank Details */}
        {(companySettings.bank_name ||
          companySettings.bank_iban ||
          companySettings.bank_bic) && (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>Bank Details</Text>
            {companySettings.bank_name && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Bank:</Text>
                <Text style={styles.bankValue}>
                  {companySettings.bank_name}
                </Text>
              </View>
            )}
            {companySettings.bank_iban && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>IBAN:</Text>
                <Text style={styles.bankValue}>
                  {companySettings.bank_iban}
                </Text>
              </View>
            )}
            {companySettings.bank_bic && (
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>BIC:</Text>
                <Text style={styles.bankValue}>
                  {companySettings.bank_bic}
                </Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}
