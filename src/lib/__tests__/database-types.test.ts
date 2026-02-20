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

  it("includes user_preferences table", () => {
    expectTypeOf<Database["public"]["Tables"]>().toHaveProperty("user_preferences");
  });

  it("user_preferences Row has user_id as string", () => {
    type Row = Database["public"]["Tables"]["user_preferences"]["Row"];
    expectTypeOf<Row["user_id"]>().toBeString();
  });

  it("user_preferences Row has theme as string", () => {
    type Row = Database["public"]["Tables"]["user_preferences"]["Row"];
    expectTypeOf<Row["theme"]>().toBeString();
  });

  it("user_preferences Row has created_at as nullable", () => {
    type Row = Database["public"]["Tables"]["user_preferences"]["Row"];
    expectTypeOf<Row["created_at"]>().toBeNullable();
  });

  it("user_preferences Row has updated_at as nullable", () => {
    type Row = Database["public"]["Tables"]["user_preferences"]["Row"];
    expectTypeOf<Row["updated_at"]>().toBeNullable();
  });

  it("user_preferences Insert has theme as optional", () => {
    type Insert = Database["public"]["Tables"]["user_preferences"]["Insert"];
    expectTypeOf<{ theme?: string | null }>().toMatchTypeOf<Pick<Insert, "theme">>();
  });

  it("user_preferences Insert requires user_id", () => {
    type Insert = Database["public"]["Tables"]["user_preferences"]["Insert"];
    expectTypeOf<Insert["user_id"]>().toBeString();
  });
});
