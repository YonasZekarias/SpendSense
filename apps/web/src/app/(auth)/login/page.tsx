"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { LogIn, Mail, Wallet } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { sanitizeReturnTo } from "@/lib/auth-constants";
import { AuthApiError } from "@/lib/auth-types";
import { loginSchema, type LoginSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnTo = useMemo(
		() => sanitizeReturnTo(searchParams.get("returnTo")),
		[searchParams],
	);
	const { signIn } = useAuth();
  const form = useForm<LoginSchema>({
		resolver: createZodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (values: LoginSchema) => {
		setError(null);

		try {
			await signIn({ email: values.email.trim(), password: values.password });
			router.replace(returnTo);
		} catch (err) {
			if (err instanceof AuthApiError && err.status === 401) {
				setError("Incorrect email or password.");
			} else {
				setError("Unable to sign in right now. Please try again.");
			}
		}
	};

	return (
		<div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl">
			<div className="grid min-h-[620px] md:grid-cols-[1fr_1.2fr]">
				<section className="relative hidden bg-primary p-8 text-primary-foreground md:flex md:flex-col md:justify-between">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_55%)]" />
					<div className="relative z-10 space-y-4">
						<div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
							<Wallet className="size-4" />
							SpendSense Ethiopia
						</div>
						<h1 className="text-4xl font-bold leading-tight">Smart spending starts here.</h1>
						<p className="max-w-xs text-sm text-primary-foreground/90">
							Track costs, compare prices, and make better money decisions every day.
						</p>
					</div>
					<p className="relative z-10 text-sm text-primary-foreground/85">Trusted by thousands of Ethiopian households.</p>
				</section>

				<section className="flex items-center justify-center bg-background px-5 py-8 sm:px-8">
					<div className="w-full max-w-md space-y-6">
						<div className="space-y-2 text-center">
							<h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
							<p className="text-sm text-muted-foreground">Sign in to continue to your SpendSense account.</p>
						</div>

			{error && (
				<AuthFeedback
					title="Sign in failed"
					message={error}
					variant="destructive"
				/>
			)}

						<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
							<div className="space-y-1.5">
								<Label htmlFor="email">Email</Label>
								<div className="relative">
									<Input
										id="email"
										type="email"
										autoComplete="email"
										placeholder="example@email.com"
										{...form.register("email")}
									/>
									<Mail className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
								</div>
								{form.formState.errors.email?.message && (
									<p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
								)}
							</div>

							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Password</Label>
									<Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
										Forgot password?
									</Link>
								</div>
								<Input
									id="password"
									type="password"
									autoComplete="current-password"
									placeholder="Enter your password"
									{...form.register("password")}
								/>
								{form.formState.errors.password?.message && (
									<p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
								)}
							</div>

							<Button className="h-11 w-full gap-2 text-sm font-semibold" disabled={form.formState.isSubmitting} type="submit">
								<LogIn className="size-4" />
								{form.formState.isSubmitting ? "Signing in..." : "Sign in"}
							</Button>
						</form>

						<p className="text-center text-sm text-muted-foreground">
							Don&apos;t have an account?{" "}
							<Link href="/register" className="font-medium text-foreground underline underline-offset-4">
								Create one
							</Link>
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}