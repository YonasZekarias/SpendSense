"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest, fetchCurrentUser, getStoredUser } from "@/lib/auth"

const STEPS = ["City", "Household Size", "Monthly Income"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [city, setCity] = useState("")
  const [householdSize, setHouseholdSize] = useState("")
  const [monthlyIncome, setMonthlyIncome] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [hydrating, setHydrating] = useState(true)

  useEffect(() => {
    const stored = getStoredUser()
    if (!stored) {
      router.push("/login")
      return
    }
    if (stored.onboarding_completed) {
      router.push("/dashboard")
      return
    }
    setHydrating(false)
  }, [router])

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step])

  function validateCurrentStep() {
    if (step === 0 && !city.trim()) {
      setError("Please enter your city.")
      return false
    }
    if (step === 1) {
      const value = Number(householdSize)
      if (!Number.isFinite(value) || value < 1) {
        setError("Household size must be at least 1.")
        return false
      }
    }
    if (step === 2) {
      const value = Number(monthlyIncome)
      if (!Number.isFinite(value) || value < 0) {
        setError("Monthly income must be zero or greater.")
        return false
      }
    }
    setError("")
    return true
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      return
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  async function handleFinish() {
    if (!validateCurrentStep()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await apiRequest(
        "/api/auth/onboarding/",
        {
          method: "PATCH",
          body: JSON.stringify({
            city: city.trim(),
            household_size: Number(householdSize),
            monthly_income: monthlyIncome,
          }),
        },
        true
      )

      const data = (await response.json()) as { message?: string; detail?: string; user?: { onboarding_completed: boolean } }
      if (!response.ok) {
        setError(data?.detail ?? "Unable to save onboarding details.")
        return
      }

      await fetchCurrentUser()
      if (data?.user?.onboarding_completed) {
        router.push("/dashboard")
      } else {
        setError("Onboarding was not completed. Please try again.")
      }
    } catch {
      setError("Unable to reach the server.")
    } finally {
      setLoading(false)
    }
  }

  if (hydrating) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </CardDescription>
          <div className="mt-2 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 0 ? (
            <div className="space-y-2">
              <Label htmlFor="city">Which city do you live in?</Label>
              <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-2">
              <Label htmlFor="householdSize">How many people are in your household?</Label>
              <Input
                id="householdSize"
                type="number"
                min={1}
                value={householdSize}
                onChange={(event) => setHouseholdSize(event.target.value)}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">What is your monthly income (ETB)?</Label>
              <Input
                id="monthlyIncome"
                type="number"
                min={0}
                step="0.01"
                value={monthlyIncome}
                onChange={(event) => setMonthlyIncome(event.target.value)}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center justify-between">
            <Button variant="outline" disabled={step === 0 || loading} onClick={() => setStep((prev) => prev - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button disabled={loading} onClick={handleFinish}>
                {loading ? "Saving..." : "Finish onboarding"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
