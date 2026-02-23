"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ActionState = { error: string } | null;

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  const action = isSignUp ? signUp : signIn;

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionState, formData: FormData) => {
      const result = await action(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.205_0.015_260)] px-4 dark:bg-[oklch(0.16_0.008_260)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.12_260)_0%,transparent_50%)]" />

      <div className="relative w-full max-w-sm">
        <div className="rounded-lg border border-border/50 bg-[oklch(0.995_0.003_85)] p-6 shadow-[0_1px_2px_0_oklch(0_0_0/0.04)] dark:bg-[oklch(0.20_0.010_260)]">
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold tracking-tight text-card-foreground">
              {isSignUp ? "Create an account" : "Sign in"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignUp
                ? "Enter your details to get started"
                : "Enter your credentials to continue"}
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs text-muted-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            {state?.error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending}
            >
              {pending
                ? isSignUp
                  ? "Signing up..."
                  : "Signing in..."
                : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp
              ? "Already have an account?"
              : "Don\u2019t have an account?"}{" "}
            <button
              type="button"
              className="text-[oklch(0.65_0.14_260)] underline-offset-4 hover:text-[oklch(0.70_0.14_260)] hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
