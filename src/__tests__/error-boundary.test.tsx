// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ErrorPage from "@/app/(app)/error";

describe("Error Boundary (error.tsx)", () => {
  afterEach(() => {
    cleanup();
  });

  it("displays friendly error message", () => {
    const error = new Error("Some internal error");
    const reset = vi.fn();
    const { getByText } = render(<ErrorPage error={error} reset={reset} />);
    expect(getByText("Something went wrong")).toBeInTheDocument();
  });

  it("displays try again button", () => {
    const error = new Error("Some internal error");
    const reset = vi.fn();
    const { getByRole } = render(<ErrorPage error={error} reset={reset} />);
    expect(getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when try again button is clicked", async () => {
    const user = userEvent.setup();
    const error = new Error("Some internal error");
    const reset = vi.fn();
    const { getByRole } = render(<ErrorPage error={error} reset={reset} />);
    await user.click(getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("does not display raw error message", () => {
    const error = new Error("SECRET_INTERNAL_ERROR_DETAILS");
    const reset = vi.fn();
    const { queryByText } = render(<ErrorPage error={error} reset={reset} />);
    expect(
      queryByText("SECRET_INTERNAL_ERROR_DETAILS")
    ).not.toBeInTheDocument();
  });
});
