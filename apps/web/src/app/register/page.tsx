"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  PiggyBank,
  User,
  Mail,
} from "lucide-react";
import { registerAndLogin } from "@/lib/auth";

const MIN_PASSWORD = 8;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"User" | "Vendor">("User");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerAndLogin({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8] dark:bg-[#101622] text-[#111318] dark:text-white antialiased">
      {/* Navbar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbdfe6] dark:border-[#222831] bg-white dark:bg-[#11151d] px-10 py-3 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-4 text-[#111318] dark:text-white">
          <div className="size-8 text-[#135bec]">
            <Wallet className="size-8" />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">SpendSense</h2>
        </Link>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <Link className="text-sm font-medium leading-normal hover:text-[#135bec] transition-colors" href="/">Home</Link>
            <Link className="text-sm font-medium leading-normal hover:text-[#135bec] transition-colors" href="#">About</Link>
            <Link className="text-sm font-medium leading-normal hover:text-[#135bec] transition-colors" href="#">Contact</Link>
          </div>
          <Link
            href="/login"
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#135bec] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
          >
            <span className="truncate">Log In</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-[1200px] flex flex-col md:flex-row bg-white dark:bg-[#1a202c] rounded-xl shadow-lg overflow-hidden border border-[#dbdfe6] dark:border-[#2d3748]">
          {/* Left Side: Visual */}
          <div
            className="hidden md:flex md:w-5/12 relative flex-col justify-between p-10 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCKr8hpjpHCl4RHpwWMARd39MqEniwNcMgISdbBZQisP260CevTUxUSNG9SCmC_jejsJ8uEh6fcocAL9TUckohjnql6qOLSkSMoWyw1TowWu7W4Iaijk2lrYYJuljNYJRtSuO3ycQCROC0EViwk8lLALdL51hIQPSBgYw9S8frFiqT0T66kmLOLFtHAx7f-IlYXVOSAxXbG9gh-TIQeMYmbdaxX8j9a0Usd4cgXxP55s-f_20Y5NWDgbZDbkePYJ-PRdW__vhLRE_g')",
            }}
          >
            <div className="absolute inset-0 bg-[#135bec]/90 mix-blend-multiply" />

            <div className="relative z-10">
              <div className="size-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm mb-6">
                <PiggyBank className="size-7 text-white" />
              </div>
              <h1 className="text-white text-4xl font-bold leading-tight mb-4">
                Master your money in Ethiopia with SpendSense.
              </h1>
              <p className="text-blue-100 text-lg">
                Join thousands of users tracking daily costs, comparing market prices, and budgeting smarter.
              </p>
            </div>

            <div className="relative z-10 mt-10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAadmpEzxPm0J34Dpr0znp11tlkgZly5f2CaqREVAc0YHqA6_gfjNRenE9nZ0gU00m-AroLERX0pscuwy50PqBQIdAa4HQyhfMi-VTPvhLeRa1P4ZtokQ5OVi-9HmyvwtlByTCFQ1WOjDeO1MaXasC5UpbHhIaqXt5WIzl4HdglIzZCXnRX0tffnZSnfXj-RpW4OoTkQ9oEvsuCzC4bjHtZC8UQ2yuyFv1OvlVn7X-CewlL0cVxRDR0pa8JD0sySXRuDDx7fHwH1q4",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAQDHZREKiD47s0Cy8q6JeeJksoCSMJP5A9E3BveoC9VL75JCHPZHAORPicOa0UxqJXj0SmHp4RR0NRh_ckSy7W5UsPYMoyCeDJbGTX-e92AVp4qCxdJdBxp2zO0yik6YSkSeykItqhOEsE0XQxcIzp8lhEgZQVeme2AWfcWUHix_M-tWLPMwgDIUX1Od9pBSXT218npIgpOuDwLdsjyjfJX7BYxl55Wg9QD3L1MWrKPVx2Y5yILhKoFXNbp4cY8a3GqarvtQavls8",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWQ8WDkR__M5IVMA5qx62tvI4Y5AUVe_6v3QCEsOIIrVvX4W5-YkF8DtrCbeA1xn8iGo0svyoLnwaKT3MvuTMgkZ8NLaqLm_8qQlhWqBBUYDwNUd3N99Rf6sFuJlzYUiJlc1OXCysQ7P8Lfk9_FqbWWdQvOjGnwqwx6RUQ6wXvkzpF1O5YeTIpWDRWJz-sFek0jQ0-cw7g2UDFoMSCWxWh2YNPZ17o2zTAi5a32c8SzWWhA3fUWCL6JORGX7KR42ue6Gp8QQ2LwB8",
                  ].map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      alt="User portrait"
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src={src}
                    />
                  ))}
                </div>
                <p className="text-white text-sm font-medium">Trusted by 10k+ locals</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="max-w-[480px] mx-auto w-full">
              <div className="mb-8">
                <h2 className="text-[#111318] dark:text-white text-3xl font-bold leading-tight mb-2">
                  Create your account
                </h2>
                <p className="text-[#616f89] dark:text-gray-400 text-sm">
                  Start tracking expenses and shopping smarter today.
                </p>
              </div>

              {/* Role Selector */}
              <div className="mb-6">
                <p className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal pb-2">
                  I am a...
                </p>
                <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#f0f2f4] dark:bg-[#2d3748] p-1">
                  <label className="group flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-checked:bg-white dark:has-checked:bg-[#1a202c] has-checked:shadow-sm transition-all">
                    <span className={`truncate text-sm font-medium ${role === "User" ? "text-[#135bec]" : "text-[#616f89] dark:text-gray-400"}`}>
                      Regular User
                    </span>
                    <input
                      className="invisible w-0 h-0"
                      name="role"
                      type="radio"
                      value="User"
                      checked={role === "User"}
                      onChange={() => setRole("User")}
                      disabled={loading}
                    />
                  </label>
                  <label className="group flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-checked:bg-white dark:has-checked:bg-[#1a202c] has-checked:shadow-sm transition-all">
                    <span className={`truncate text-sm font-medium ${role === "Vendor" ? "text-[#135bec]" : "text-[#616f89] dark:text-gray-400"}`}>
                      Vendor
                    </span>
                    <input
                      className="invisible w-0 h-0"
                      name="role"
                      type="radio"
                      value="Vendor"
                      checked={role === "Vendor"}
                      onChange={() => setRole("Vendor")}
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                {error && (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 whitespace-pre-line"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                {/* Full Name */}
                <label className="flex flex-col w-full">
                  <p className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal pb-2">
                    Full Name
                  </p>
                  <div className="relative">
                    <input
                      className="flex w-full min-w-0 rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-[#dbdfe6] dark:border-[#4a5568] bg-white dark:bg-[#2d3748] focus:border-[#135bec] h-12 placeholder:text-[#9ca3af] px-4 pr-12 text-base font-normal leading-normal transition-all disabled:opacity-60"
                      placeholder="Enter your full name"
                      required
                      type="text"
                      name="full_name"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                    />
                    <User className="absolute right-4 top-3.5 size-5 text-[#9ca3af]" />
                  </div>
                </label>

                {/* Email */}
                <label className="flex flex-col w-full">
                  <p className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal pb-2">
                    Email Address
                  </p>
                  <div className="relative">
                    <input
                      className="flex w-full min-w-0 rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-[#dbdfe6] dark:border-[#4a5568] bg-white dark:bg-[#2d3748] focus:border-[#135bec] h-12 placeholder:text-[#9ca3af] px-4 pr-12 text-base font-normal leading-normal transition-all disabled:opacity-60"
                      placeholder="name@example.com"
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    <Mail className="absolute right-4 top-3.5 size-5 text-[#9ca3af]" />
                  </div>
                </label>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex flex-col w-full">
                    <p className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal pb-2">
                      Password
                    </p>
                    <input
                      className="flex w-full min-w-0 rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-[#dbdfe6] dark:border-[#4a5568] bg-white dark:bg-[#2d3748] focus:border-[#135bec] h-12 placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal transition-all disabled:opacity-60"
                      placeholder="Min. 8 characters"
                      required
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </label>
                  <label className="flex flex-col w-full">
                    <p className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal pb-2">
                      Confirm Password
                    </p>
                    <input
                      className="flex w-full min-w-0 rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#135bec]/50 border border-[#dbdfe6] dark:border-[#4a5568] bg-white dark:bg-[#2d3748] focus:border-[#135bec] h-12 placeholder:text-[#9ca3af] px-4 text-base font-normal leading-normal transition-all disabled:opacity-60"
                      placeholder="Re-enter password"
                      required
                      type="password"
                      name="confirm_password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </label>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 mt-2">
                  <div className="flex h-6 items-center">
                    <input
                      className="h-4 w-4 rounded border-gray-300 text-[#135bec] focus:ring-[#135bec] dark:border-gray-600 dark:bg-gray-700"
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      disabled={loading}
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label className="font-medium text-[#616f89] dark:text-gray-400" htmlFor="terms">
                      By creating an account, you agree to our{" "}
                      <a className="font-semibold text-[#135bec] hover:text-blue-600" href="#">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a className="font-semibold text-[#135bec] hover:text-blue-600" href="#">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button
                  className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#135bec] h-12 px-4 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-[#135bec] transition-all mt-2 disabled:opacity-60 disabled:pointer-events-none"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-[#1a202c] px-3 text-sm text-[#616f89] dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google */}
              <button
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#dbdfe6] dark:border-[#4a5568] bg-white dark:bg-[#2d3748] h-12 px-4 text-[#111318] dark:text-white text-sm font-medium leading-normal shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                type="button"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </button>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#616f89] dark:text-gray-400">
                  Already have an account?{" "}
                  <Link className="font-semibold text-[#135bec] hover:text-blue-600" href="/login">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
