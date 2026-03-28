"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { useAuth } from "@/providers/auth-provider";
import { AuthApiError } from "@/services/authService";

export default function RegisterPage() {
	const router = useRouter();
	const { signUp } = useAuth();

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSuccessMessage(null);

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setIsSubmitting(true);

		try {
			await signUp({
				full_name: fullName.trim(),
				email: email.trim(),
				password,
			});

			setSuccessMessage("Your account has been created. You can sign in now.");
			router.push("/login");
		} catch (err) {
			if (err instanceof AuthApiError && err.status === 400) {
				setError("Please review your details and try again.");
			} else {
				setError("Unable to create your account right now. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthShell
			title="Create your account"
			description="Start tracking your spending and saving smarter."
			footer={
				<p className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/login" className="text-foreground underline underline-offset-4">
						Sign in
					</Link>
				</p>
			}
		>
			{error && (
				<AuthFeedback
					title="Registration failed"
					message={error}
					variant="destructive"
				/>
			)}

			{successMessage && (
				<AuthFeedback title="Success" message={successMessage} />
			)}

			<form className="space-y-4" onSubmit={onSubmit} noValidate>
				<div className="space-y-1.5">
					<Label htmlFor="full-name">Full name</Label>
					<Input
						id="full-name"
						type="text"
						autoComplete="name"
						value={fullName}
						onChange={(event) => setFullName(event.target.value)}
						required
					/>
				</div>

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
						autoComplete="new-password"
						minLength={8}
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="confirm-password">Confirm password</Label>
					<Input
						id="confirm-password"
						type="password"
						autoComplete="new-password"
						minLength={8}
						value={confirmPassword}
						onChange={(event) => setConfirmPassword(event.target.value)}
						required
					/>
				</div>

				<Button className="w-full" disabled={isSubmitting} type="submit">
					{isSubmitting ? "Creating account..." : "Create account"}
				</Button>
			</form>
		</AuthShell>
	);
}