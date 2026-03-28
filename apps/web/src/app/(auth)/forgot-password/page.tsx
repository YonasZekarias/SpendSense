"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { useAuth } from "@/providers/auth-provider";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const form = useForm<ForgotPasswordSchema>({
    resolver: createZodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (values: ForgotPasswordSchema) => {
    setError(null);

    try {
      await requestPasswordReset(values.email.trim());
      setIsSubmitted(true);
    } catch {
      setError("Unable to process your request right now. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we will send reset instructions if your account exists."
      footer={
        <p className="text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      }
    >
      {error && (
        <AuthFeedback
          title="Request failed"
          message={error}
          variant="destructive"
        />
      )}

      {isSubmitted && (
        <AuthFeedback
          title="Check your email"
          message="If an account exists with this email, reset instructions have been sent."
        />
      )}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email?.message && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Submitting..." : "Send reset instructions"}
        </Button>
      </form>
    </AuthShell>
  );
}
