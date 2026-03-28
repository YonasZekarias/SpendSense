"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { useAuth } from "@/providers/auth-provider";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmPasswordReset } = useAuth();
  const form = useForm<ResetPasswordSchema>({
    resolver: createZodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (values: ResetPasswordSchema) => {
    setError(null);

    if (!token) {
      setError("Reset link is missing a valid token.");
      return;
    }

    try {
      await confirmPasswordReset(token, values.password);
      setIsSubmitted(true);
      router.push("/login");
    } catch {
      setError("Unable to reset your password. The link may be expired.");
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a new password to continue using your account."
      footer={
        <p className="text-sm text-muted-foreground">
          Need a new reset link?{" "}
          <Link href="/forgot-password" className="text-foreground underline underline-offset-4">
            Request one
          </Link>
        </p>
      }
    >
      {error && (
        <AuthFeedback
          title="Reset failed"
          message={error}
          variant="destructive"
        />
      )}

      {isSubmitted && (
        <AuthFeedback
          title="Password updated"
          message="Your password has been reset. Redirecting to sign in."
        />
      )}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            {...form.register("password")}
          />
          {form.formState.errors.password?.message && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword?.message && (
            <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
