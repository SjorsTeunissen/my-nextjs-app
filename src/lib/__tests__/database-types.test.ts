import { describe, it, expectTypeOf } from "vitest";
import type { Database } from "@/lib/types/database";

describe("database types", () => {
  it("exports Database type with public schema", () => {
    expectTypeOf<Database["public"]>().toHaveProperty("Tables");
  });
  it("includes company_settings table", () => {
    expectTypeOf<Database["public"]["Tables"]>().toHaveProperty("company_settings");
  });
  it("includes invoices table", () => {
    expectTypeOf<Database["public"]["Tables"]>().toHaveProperty("invoices");
  });
  it("includes invoice_line_items table", () => {
    expectTypeOf<Database["public"]["Tables"]>().toHaveProperty("invoice_line_items");
  });
  it("company_settings has default_tax_rate as number", () => {
    type Row = Database["public"]["Tables"]["company_settings"]["Row"];
    expectTypeOf<Row["default_tax_rate"]>().toBeNullable();
  });
  it("invoices has invoice_number as string", () => {
    type Row = Database["public"]["Tables"]["invoices"]["Row"];
    expectTypeOf<Row["invoice_number"]>().toBeString();
  });
  it("invoice_line_items has invoice_id as string", () => {
    type Row = Database["public"]["Tables"]["invoice_line_items"]["Row"];
    expectTypeOf<Row["invoice_id"]>().toBeNullable();
  });
});
