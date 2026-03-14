"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { clearAuth, fetchCurrentUser, getStoredUser, type UserProfile } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const stored = getStoredUser()
    if (!stored) {
      router.push("/login")
      return
    }

    fetchCurrentUser().then((profile) => {
      if (!profile) {
        router.push("/login")
        return
      }
      if (!profile.onboarding_completed) {
        router.push("/onboarding")
        return
      }
      setUser(profile)
    })
  }, [router])

  function logout() {
    clearAuth()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Welcome to SpendSense</CardTitle>
          <CardDescription>Your account setup is complete.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> {user?.full_name ?? "-"}
          </p>
          <p>
            <span className="font-medium">City:</span> {user?.city ?? "-"}
          </p>
          <p>
            <span className="font-medium">Household size:</span> {user?.household_size ?? "-"}
          </p>
          <p>
            <span className="font-medium">Monthly income:</span> {user?.monthly_income ?? "-"}
          </p>
          <Button className="mt-4" variant="outline" onClick={logout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
