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
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.13_0.02_281)] px-4 dark:bg-[oklch(0.1_0.02_281)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.08_281)_0%,transparent_50%)]" />

      <div className="relative w-full max-w-sm">
        <div className="rounded-lg border border-border/50 bg-card p-6 shadow-lg">
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
              className="text-primary underline-offset-4 hover:underline"
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
