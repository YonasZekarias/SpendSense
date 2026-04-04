"use client";

import { Button } from "@repo/ui/components/button";
import { useAuth } from "@/providers/auth-provider";

export default function UsersPage() {
  const { status, user, signOut } = useAuth();

  if (status === "loading") {
    return <main className="p-6">Loading your profile...</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">User Area</h1>
      <p className="text-muted-foreground">This route is protected by middleware.</p>

      <section className="rounded-xl border border-border/70 p-4">
        <h2 className="text-sm font-medium text-muted-foreground">Current Session</h2>
        <p className="mt-2 text-sm">Name: {user?.full_name || "Unknown"}</p>
        <p className="mt-2 text-sm">Role: {user?.role || "Unknown"}</p>
        <p className="text-sm">Email: {user?.email || "Unknown"}</p>
      </section>

      <div>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </main>
  );
}
