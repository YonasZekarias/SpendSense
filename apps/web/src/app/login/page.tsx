"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Mail,
  EyeOff,
  Eye,
  LogIn,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#101622]">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbdfe6] dark:border-[#222b3a] bg-white dark:bg-[#111827] px-6 lg:px-10 py-3 sticky top-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-3 text-[#111318] dark:text-white"
        >
          <div className="size-8 flex items-center justify-center text-[#135bec]">
            <Wallet className="size-7" />
          </div>
          <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            SpendSense Ethiopia
          </h2>
        </Link>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-[#f0f2f4] dark:bg-[#1f2937] hover:bg-[#e5e7eb] dark:hover:bg-[#374151] text-[#111318] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
            <span className="truncate">Amharic</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col md:flex-row">
        {/* Left Section: Visual/Brand */}
        <div className="hidden md:flex flex-col md:w-1/2 lg:w-5/12 bg-[#135bec] relative overflow-hidden justify-between p-12 text-white">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Abstract financial background"
              className="w-full h-full object-cover opacity-20 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGt3iHQP6R4QoDVTz66g24q77l8bkDXz2HjaDbpBFq2Mf8CVeqI6zRxk2wGDkffRta3bDQFsLhZDBHSLD_b7RxQ5bMxPYJecDhvJ9MQuM4Mu3Q4NP19S5KXkZcYyzNxqfXD_XU8tznOI-P-7PWX6ZypJzJ6Pn3jwEillrHT9dOdiix5ol0fv0-W0sD2w5Viw6510O2t2vwnnmmrhiCvF4ijUOdxOMar2H5hD0tUQNZ1BIiZlrg1-PNOPY1ZBtT6SgZE9I-y-J2uuc"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#135bec]/90 to-blue-900/90 mix-blend-multiply" />
          </div>

          <div className="relative z-10 mt-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-white/20 mb-6">
              <TrendingUp className="size-4" />
              <span>#1 Financial Tool in Ethiopia</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Smart spending starts here.
            </h1>
            <p className="text-blue-100 text-lg max-w-sm">
              Join thousands of Ethiopians tracking costs, budgeting better, and
              saving more every day.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-4">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuD0SKQfiGbr-irFZ32B4CyBeSmGojaEp8VgAXffim3CZnk8KGyNgEwQGA8fzI2PMmJ5Z7WscWnbuy4mUCkM_hlCaPQRHjSjjyfGh3Jo8ujAZBvRPNKhPogcB0OXcK34HrnWIjFpnxGLN1gREahM_cBCNX5H2xHfp3DDgj7F9GXp-ut_RgeTWrFaLnUsSPDfEjBO9broTaZ0QYP4DDa6u_XVgsrjTaG2CAIkx-lHO6ZpurO_WqC-9ySUxoStxDpPP0GeZU-EBv9gYjE",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCwwBzfjvQsF4mzroqwJ35ASINrxuX3K51cB5fjbuNJhurNNw2ldsxOg8NXgRQw3rUK-FaRa6L73XPzns8kJXORwg787PBJp1gFeC1ANSwxNTYn-kFMrUeK42jKDeI1Ei9HmPxHTA7mUfkhZUzWv63rPXwdF8AdcwDBRwgQqg3Gdh6KKeZ_y6Wf-CLF6U5Z8Xt3LobYrXa6xw5AzG_pKIV8SIlOay8xaeeN7GhsGWenBF7wGX6rGQxGMqhA3K-87PF8EvwWw8KSytg",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuC2cK0nnKcVgcCxZVz9euFtHj_YuAwA0aWCwlVRE3dZDgsy3wSnaW5oKZ8PA9HD7X5MQIisoVZdc-RhoIQHGxnCbV_5cBjtVq2wcYW9NvjyAFoo_q9jBMF2TIALpmGNITqVrDLJf-bSjEZX1RHaD_hMn9wq6nzyShbT2kTes2zrlG5PVU_asKdf2ULxOWI0-35D2-fBErGPvnIuVUsNq20sIjtXsr19n8qu7Zu4ZCed-Wj6WN2BpBl-MjUSkLqD5z18CoCUSDzYMr0",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#135bec] bg-gray-200 overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="User"
                      className="w-full h-full object-cover"
                      src={src}
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-100 font-medium">
                Trusted by 50,000+ users
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-[#f6f6f8] dark:bg-[#101622]">
          <div className="w-full max-w-[480px] bg-white dark:bg-[#1f2937] rounded-xl shadow-lg dark:shadow-none dark:border dark:border-gray-700 p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-[#111318] dark:text-white text-3xl font-bold leading-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base">
                Track your spending and shop smarter.
              </p>
            </div>

            <form className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-[#111318] dark:text-gray-200 text-sm font-medium"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 rounded-lg border border-[#dbdfe6] dark:border-gray-600 bg-white dark:bg-[#111827] text-[#111318] dark:text-white placeholder:text-gray-400 px-4 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    required
                    type="email"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Mail className="size-5" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label
                    className="text-[#111318] dark:text-gray-200 text-sm font-medium"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    className="text-[#135bec] hover:text-blue-700 text-sm font-medium transition-colors"
                    href="#"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    className="w-full h-12 rounded-lg border border-[#dbdfe6] dark:border-gray-600 bg-white dark:bg-[#111827] text-[#111318] dark:text-white placeholder:text-gray-400 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <Eye className="size-5" />
                    ) : (
                      <EyeOff className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In */}
              <button
                className="w-full bg-[#135bec] hover:bg-blue-700 text-white h-12 rounded-lg font-bold text-base mt-2 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                type="submit"
              >
                <LogIn className="size-5" />
                Sign In
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                <span className="shrink-0 mx-4 text-gray-400 text-sm">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
              </div>

              {/* Google */}
              <button
                className="w-full bg-white dark:bg-[#111827] border border-[#dbdfe6] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-[#111318] dark:text-white h-12 rounded-lg font-medium text-base transition-all flex items-center justify-center gap-3"
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056-0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208-0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  className="text-[#135bec] font-bold hover:underline"
                  href="/register"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <div className="mt-8 flex justify-center gap-2 items-center opacity-75">
              <Lock className="size-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">
                Secured by spendsense
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
