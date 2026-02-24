// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

vi.mock("@/app/(app)/settings/actions", () => ({
  saveCompanySettings: vi.fn(),
  uploadLogo: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { SettingsForm } from "@/app/(app)/settings/page";
import type { Database } from "@/lib/types/database";

type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];

function createSettings(
  overrides: Partial<CompanySettings> = {}
): CompanySettings {
  return {
    id: "settings-1",
    company_name: "Test Corp",
    address_line1: "123 Test St",
    address_line2: "Floor 2",
    city: "Test City",
    postal_code: "12345",
    country: "Netherlands",
    email: "test@corp.com",
    phone: "+31 20 555 0100",
    bank_name: "Test Bank",
    bank_iban: "NL91ABNA0417164300",
    bank_bic: "TESTBIC",
    vat_number: "NL123456789B01",
    default_tax_rate: 21,
    logo_url: null,
    updated_at: null,
    updated_by: null,
    ...overrides,
  };
}

describe("SettingsForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields with correct labels", () => {
    const { getByLabelText } = render(
      <SettingsForm data={createSettings()} />
    );

    expect(getByLabelText("Company Name")).toBeInTheDocument();
    expect(getByLabelText("Address Line 1")).toBeInTheDocument();
    expect(getByLabelText("Address Line 2")).toBeInTheDocument();
    expect(getByLabelText("City")).toBeInTheDocument();
    expect(getByLabelText("Postal Code")).toBeInTheDocument();
    expect(getByLabelText("Country")).toBeInTheDocument();
    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Phone")).toBeInTheDocument();
    expect(getByLabelText("Bank Name")).toBeInTheDocument();
    expect(getByLabelText("IBAN")).toBeInTheDocument();
    expect(getByLabelText("BIC")).toBeInTheDocument();
    expect(getByLabelText("VAT Number")).toBeInTheDocument();
    expect(getByLabelText("Default Tax Rate (%)")).toBeInTheDocument();
  });

  it("pre-fills form fields with existing data", () => {
    const { getByLabelText } = render(
      <SettingsForm data={createSettings()} />
    );

    expect(getByLabelText("Company Name")).toHaveValue("Test Corp");
    expect(getByLabelText("Address Line 1")).toHaveValue("123 Test St");
    expect(getByLabelText("Address Line 2")).toHaveValue("Floor 2");
    expect(getByLabelText("City")).toHaveValue("Test City");
    expect(getByLabelText("Postal Code")).toHaveValue("12345");
    expect(getByLabelText("Country")).toHaveValue("Netherlands");
    expect(getByLabelText("Email")).toHaveValue("test@corp.com");
    expect(getByLabelText("Phone")).toHaveValue("+31 20 555 0100");
    expect(getByLabelText("Bank Name")).toHaveValue("Test Bank");
    expect(getByLabelText("IBAN")).toHaveValue("NL91ABNA0417164300");
    expect(getByLabelText("BIC")).toHaveValue("TESTBIC");
    expect(getByLabelText("VAT Number")).toHaveValue("NL123456789B01");
    expect(getByLabelText("Default Tax Rate (%)")).toHaveValue(21);
  });

  it("handles null values in form fields", () => {
    const { getByLabelText } = render(
      <SettingsForm
        data={createSettings({
          company_name: null,
          address_line1: null,
          city: null,
        })}
      />
    );

    expect(getByLabelText("Company Name")).toHaveValue("");
    expect(getByLabelText("Address Line 1")).toHaveValue("");
    expect(getByLabelText("City")).toHaveValue("");
  });

  it("shows logo preview when logo_url is present", () => {
    const { getByAltText } = render(
      <SettingsForm
        data={createSettings({
          logo_url: "https://storage.example.com/logo.png",
        })}
      />
    );

    const img = getByAltText("Company logo");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://storage.example.com/logo.png"
    );
  });

  it("does not show logo preview when logo_url is null", () => {
    const { queryByAltText } = render(
      <SettingsForm data={createSettings({ logo_url: null })} />
    );

    expect(queryByAltText("Company logo")).not.toBeInTheDocument();
  });

  it("renders a save button", () => {
    const { container } = render(
      <SettingsForm data={createSettings()} />
    );

    const submitButtons = container.querySelectorAll('button[type="submit"]');
    expect(submitButtons.length).toBeGreaterThanOrEqual(1);
    expect(submitButtons[0].textContent).toBe("Save Settings");
  });

  it("renders section headings for all form sections", () => {
    const { container } = render(
      <SettingsForm data={createSettings()} />
    );

    const sectionHeadings = container.querySelectorAll("h2");
    const headingTexts = Array.from(sectionHeadings).map((el) => el.textContent);

    expect(headingTexts).toContain("Company Information");
    expect(headingTexts).toContain("Address");
    expect(headingTexts).toContain("Contact");
    expect(headingTexts).toContain("Banking");
    expect(headingTexts).toContain("Tax");
    expect(headingTexts).toContain("Logo");
  });

  it("wraps sections in cards", () => {
    const { container } = render(
      <SettingsForm data={createSettings()} />
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards.length).toBe(6);
  });

  it("validates file type on logo upload input", () => {
    const { getByLabelText } = render(
      <SettingsForm data={createSettings()} />
    );

    const fileInput = getByLabelText("Upload Logo");
    expect(fileInput).toHaveAttribute("accept", "image/png,image/jpeg");
  });

  it("renders the logo upload section with file input", () => {
    const { getByLabelText, container } = render(
      <SettingsForm data={createSettings()} />
    );

    expect(getByLabelText("Upload Logo")).toBeInTheDocument();
    const uploadButtons = container.querySelectorAll('button[type="button"]');
    const uploadButton = Array.from(uploadButtons).find(
      (btn) => btn.textContent === "Upload"
    );
    expect(uploadButton).toBeTruthy();
  });

  it("renders sidebar navigation with all section links", () => {
    const { getByRole } = render(
      <SettingsForm data={createSettings()} />
    );

    const nav = getByRole("navigation");
    const buttons = nav.querySelectorAll("button");
    const labels = Array.from(buttons).map((btn) => btn.textContent);

    expect(labels).toEqual(["Company", "Address", "Contact", "Banking", "Tax", "Logo"]);
  });

  it("shows Company section by default and hides others", () => {
    const { container, getByLabelText } = render(
      <SettingsForm data={createSettings()} />
    );

    expect(getByLabelText("Company Name").closest('[class*="hidden"]')).toBeNull();

    const addressInput = getByLabelText("Address Line 1");
    expect(addressInput.closest(".hidden")).not.toBeNull();
  });

  it("switches visible section when sidebar nav is clicked", () => {
    const { getByRole, getByLabelText } = render(
      <SettingsForm data={createSettings()} />
    );

    const nav = getByRole("navigation");
    const addressButton = Array.from(nav.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Address"
    )!;

    fireEvent.click(addressButton);

    expect(getByLabelText("Address Line 1").closest(".hidden")).toBeNull();
    expect(getByLabelText("Company Name").closest(".hidden")).not.toBeNull();
  });

  it("highlights active section in sidebar with primary styling", () => {
    const { getByRole } = render(
      <SettingsForm data={createSettings()} />
    );

    const nav = getByRole("navigation");
    const companyButton = Array.from(nav.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Company"
    )!;

    expect(companyButton.className).toContain("bg-primary/10");
    expect(companyButton.className).toContain("text-primary");
  });

  it("keeps all 13 form fields in DOM regardless of active section", () => {
    const { getByLabelText, getByRole } = render(
      <SettingsForm data={createSettings()} />
    );

    const nav = getByRole("navigation");
    const taxButton = Array.from(nav.querySelectorAll("button")).find(
      (btn) => btn.textContent === "Tax"
    )!;
    fireEvent.click(taxButton);

    expect(getByLabelText("Company Name")).toBeInTheDocument();
    expect(getByLabelText("Address Line 1")).toBeInTheDocument();
    expect(getByLabelText("Address Line 2")).toBeInTheDocument();
    expect(getByLabelText("City")).toBeInTheDocument();
    expect(getByLabelText("Postal Code")).toBeInTheDocument();
    expect(getByLabelText("Country")).toBeInTheDocument();
    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Phone")).toBeInTheDocument();
    expect(getByLabelText("Bank Name")).toBeInTheDocument();
    expect(getByLabelText("IBAN")).toBeInTheDocument();
    expect(getByLabelText("BIC")).toBeInTheDocument();
    expect(getByLabelText("VAT Number")).toBeInTheDocument();
    expect(getByLabelText("Default Tax Rate (%)")).toBeInTheDocument();
  });

  it("wraps all form inputs in a single form element", () => {
    const { container } = render(
      <SettingsForm data={createSettings()} />
    );

    const form = container.querySelector("form");
    expect(form).not.toBeNull();

    const formInputs = form!.querySelectorAll("input[name]");
    expect(formInputs.length).toBe(13);
  });
});
