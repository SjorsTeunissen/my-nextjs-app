// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useActionState: vi.fn((_action: unknown, initialState: unknown) => [
      initialState,
      vi.fn(),
      false,
    ]),
  };
});

vi.mock("./actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the sign in form with email and password fields", () => {
    const { getByLabelText, getByRole } = render(<LoginPage />);
    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Password")).toBeInTheDocument();
    expect(getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows ink navy gradient background with centered card layout", () => {
    const { container } = render(<LoginPage />);
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.className).toContain("min-h-screen");
    expect(outerDiv.className).toContain("items-center");
    expect(outerDiv.className).toContain("justify-center");
    // Verify ink navy background (hue 260 from Ink & Ledger palette)
    expect(outerDiv.className).toMatch(/bg-\[oklch\(0\.205/);
  });

  it("has a gradient overlay element", () => {
    const { container } = render(<LoginPage />);
    const overlay = container.querySelector(".absolute.inset-0");
    expect(overlay).toBeInTheDocument();
    expect(overlay?.className).toMatch(/bg-\[radial-gradient/);
  });

  it("toggles between sign in and sign up modes", () => {
    const { getByText, getByRole } = render(<LoginPage />);
    expect(getByText("Sign in")).toBeInTheDocument();

    fireEvent.click(getByRole("button", { name: "Sign Up" }));

    expect(getByText("Create an account")).toBeInTheDocument();
    expect(
      getByRole("button", { name: "Sign In" })
    ).toBeInTheDocument();
  });

  it("preserves sign-in/sign-up toggle link", () => {
    const { getByText } = render(<LoginPage />);
    expect(getByText(/Don.t have an account/)).toBeInTheDocument();
    expect(getByText("Sign Up")).toBeInTheDocument();
  });

  it("renders error state with styled container", async () => {
    const { useActionState } = await import("react");
    vi.mocked(useActionState).mockReturnValue([
      { error: "Invalid credentials" },
      vi.fn(),
      false,
    ]);

    const { getByText } = render(<LoginPage />);
    const errorEl = getByText("Invalid credentials");
    expect(errorEl).toBeInTheDocument();
    expect(errorEl.className).toContain("destructive");
  });

  it("uses a card with warm Surface background and Elevation-1 shadow", () => {
    const { container } = render(<LoginPage />);
    const card = container.querySelector(".rounded-lg.border");
    expect(card).toBeInTheDocument();
    // Warm Surface background from Ink & Ledger palette
    expect(card?.className).toMatch(/bg-\[oklch\(0\.995/);
    // Elevation-1 shadow
    expect(card?.className).toMatch(/shadow-\[0/);
  });

  it("has responsive padding for small screens", () => {
    const { container } = render(<LoginPage />);
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.className).toContain("px-4");
  });

  it("constrains card width with max-w-sm", () => {
    const { container } = render(<LoginPage />);
    const cardWrapper = container.querySelector(".max-w-sm");
    expect(cardWrapper).toBeInTheDocument();
    expect(cardWrapper?.className).toContain("w-full");
  });

  it("sign-in/sign-up toggle link uses navy palette color", () => {
    const { getByText } = render(<LoginPage />);
    const toggleButton = getByText("Sign Up");
    // Navy palette color (oklch hue 260) for visibility on dark background
    expect(toggleButton.className).toMatch(/text-\[oklch\(0\.65/);
  });
});
