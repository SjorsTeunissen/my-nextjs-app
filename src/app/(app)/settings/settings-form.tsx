"use client";

import { useActionState, useState, useRef } from "react";
import { saveCompanySettings, uploadLogo } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Database } from "@/lib/types/database";

type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];

type SaveActionState = { success?: boolean; error?: string } | null;

export function SettingsForm({ data }: { data: CompanySettings }) {
  const [saveState, saveFormAction, savePending] = useActionState(
    async (prev: SaveActionState, formData: FormData) => {
      const result = await saveCompanySettings(prev, formData);
      return result ?? null;
    },
    null
  );

  const [logoUrl, setLogoUrl] = useState<string | null>(data.logo_url);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only PNG and JPEG images are allowed");
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size must be less than 2MB");
      return;
    }

    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    formData.set("logo", file);

    const result = await uploadLogo(formData);

    setUploading(false);

    if (result.error) {
      setUploadError(result.error);
    } else if (result.logoUrl) {
      setLogoUrl(result.logoUrl);
    }
  };

  return (
    <div className="space-y-1">
      {saveState?.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Settings saved successfully.
        </div>
      )}

      {saveState?.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {saveState.error}
        </div>
      )}

      <form action={saveFormAction} className="space-y-6">
        {/* Company Information */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">Company Information</h2>
          <Separator className="my-2" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                type="text"
                defaultValue={data.company_name ?? ""}
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">Address</h2>
          <Separator className="my-2" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="address_line1">Address Line 1</Label>
              <Input
                id="address_line1"
                name="address_line1"
                type="text"
                defaultValue={data.address_line1 ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                name="address_line2"
                type="text"
                defaultValue={data.address_line2 ?? ""}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue={data.city ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  type="text"
                  defaultValue={data.postal_code ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  defaultValue={data.country ?? ""}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">Contact</h2>
          <Separator className="my-2" />
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={data.email ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={data.phone ?? ""}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Banking */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">Banking</h2>
          <Separator className="my-2" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                name="bank_name"
                type="text"
                defaultValue={data.bank_name ?? ""}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bank_iban">IBAN</Label>
                <Input
                  id="bank_iban"
                  name="bank_iban"
                  type="text"
                  defaultValue={data.bank_iban ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bank_bic">BIC</Label>
                <Input
                  id="bank_bic"
                  name="bank_bic"
                  type="text"
                  defaultValue={data.bank_bic ?? ""}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tax */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">Tax</h2>
          <Separator className="my-2" />
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="vat_number">VAT Number</Label>
                <Input
                  id="vat_number"
                  name="vat_number"
                  type="text"
                  defaultValue={data.vat_number ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="default_tax_rate">
                  Default Tax Rate (%)
                </Label>
                <Input
                  id="default_tax_rate"
                  name="default_tax_rate"
                  type="number"
                  step="0.01"
                  defaultValue={data.default_tax_rate ?? ""}
                />
              </div>
            </div>
          </div>
        </section>

        <Button type="submit" disabled={savePending}>
          {savePending ? "Saving..." : "Save Settings"}
        </Button>
      </form>

      {/* Logo Upload (separate from the main form) */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Logo</h2>
        <Separator className="my-2" />
        <div className="space-y-3">
          {logoUrl && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Company logo"
                className="h-24 w-24 rounded-md border object-contain"
              />
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="logo">Upload Logo</Label>
              <Input
                id="logo"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={handleLogoUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}
        </div>
      </section>
    </div>
  );
}
