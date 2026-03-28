"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { sanitizeReturnTo } from "@/lib/auth-constants";
import { useAuth } from "@/providers/auth-provider";
import { AuthApiError } from "@/services/authService";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnTo = useMemo(
		() => sanitizeReturnTo(searchParams.get("returnTo")),
		[searchParams],
	);
	const { signIn } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			await signIn({ email: email.trim(), password });
			router.replace(returnTo);
		} catch (err) {
			if (err instanceof AuthApiError && err.status === 401) {
				setError("Incorrect email or password.");
			} else {
				setError("Unable to sign in right now. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			title="Welcome back"
			description="Sign in to continue to your SpendSense account."
			footer={
				<p className="text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link href="/register" className="text-foreground underline underline-offset-4">
						Create one
					</Link>
				</p>
			}
		>
			{error && (
				<AuthFeedback
					title="Sign in failed"
					message={error}
					variant="destructive"
				/>
			)}

			<form className="space-y-4" onSubmit={onSubmit} noValidate>
				<div className="space-y-1.5">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
				</div>

				<Button className="w-full" disabled={isSubmitting} type="submit">
					{isSubmitting ? "Signing in..." : "Sign in"}
				</Button>
			</form>

			<p className="text-sm text-muted-foreground">
				Forgot your password?{" "}
				<Link href="/forgot-password" className="text-foreground underline underline-offset-4">
					Reset it
				</Link>
			</p>
		</AuthShell>
	);
}