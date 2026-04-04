"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Mail, UserRound, Wallet } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { getAuthErrorStatus } from "@/lib/auth-types";
import { registerSchema, type RegisterSchema } from "@/lib/validation/auth-schemas";
import { createZodResolver } from "@/lib/validation/zod-resolver";
import { useAuth } from "@/providers/auth-provider";

export default function RegisterPage() {
	const router = useRouter();
	const { signUp } = useAuth();
  const form = useForm<RegisterSchema>({
		resolver: createZodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (values: RegisterSchema) => {
		setError(null);

		try {
			await signUp({
				full_name: values.full_name.trim(),
				email: values.email.trim(),
				password: values.password,
			});

			router.push("/login");
		} catch (err) {
			if (getAuthErrorStatus(err) === 400) {
				setError("Please review your details and try again.");
			} else {
				setError("Unable to create your account right now. Please try again.");
			}
		}
	};

	return (
		<div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-border/50 bg-background shadow-xl">
			<div className="grid min-h-162.5 md:grid-cols-[1fr_1.25fr]">
				<section className="relative hidden bg-primary p-8 text-primary-foreground md:flex md:flex-col md:justify-between">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_58%)]" />
					<div className="relative z-10 space-y-4">
						<div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
							<Wallet className="size-4" />
							BudgetTracker ET
						</div>
						<h1 className="text-4xl font-bold leading-tight">Master your money in Ethiopia.</h1>
						<p className="max-w-xs text-sm text-primary-foreground/90">
							Track daily costs, compare market prices, and build stronger savings habits.
						</p>
					</div>
					<p className="relative z-10 text-sm text-primary-foreground/85">Trusted by 10k+ locals</p>
				</section>

				<section className="flex items-center justify-center bg-background px-5 py-8 sm:px-8">
					<div className="w-full max-w-lg space-y-5">
						<div className="space-y-1">
							<h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
							<p className="text-sm text-muted-foreground">Start tracking expenses and shopping smarter today.</p>
						</div>

			{error && (
				<AuthFeedback
					title="Registration failed"
					message={error}
					variant="destructive"
				/>
			)}

						<Form {...form}>
							<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
								<FormField
									control={form.control}
									name="full_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full name</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														id="full_name"
														type="text"
														autoComplete="name"
														placeholder="Enter your full name"
														{...field}
													/>
													<UserRound className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email address</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														id="email"
														type="email"
														autoComplete="email"
														placeholder="name@example.com"
														{...field}
													/>
													<Mail className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid gap-4 sm:grid-cols-2">
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Password</FormLabel>
												<FormControl>
													<Input
														id="password"
														type="password"
														autoComplete="new-password"
														placeholder="Min. 8 characters"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Confirm password</FormLabel>
												<FormControl>
													<Input
														id="confirmPassword"
														type="password"
														autoComplete="new-password"
														placeholder="Re-enter password"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<Button className="h-11 w-full text-sm font-semibold" disabled={form.formState.isSubmitting} type="submit">
									{form.formState.isSubmitting ? "Creating account..." : "Create account"}
								</Button>
							</form>
						</Form>

						<p className="text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link href="/login" className="font-medium text-foreground underline underline-offset-4">
								Sign in
							</Link>
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}