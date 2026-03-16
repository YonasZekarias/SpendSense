"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storeAuth, type UserProfile } from "@/lib/auth"

type SignupResponse = {
  tokens: {
    access: string
    refresh: string
  }
  user: UserProfile
}

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone: phone || null,
          password,
          remember_me: rememberMe,
        }),
      })

      const data = (await response.json()) as SignupResponse & {
        detail?: string
        email?: string[]
        password?: string[]
      }

      if (!response.ok) {
        const message = data?.detail ?? data?.email?.[0] ?? data?.password?.[0] ?? "Unable to sign up."
        setError(message)
        return
      }

      storeAuth(data.tokens, data.user, rememberMe)
      router.push("/onboarding")
    } catch {
      setError("Unable to reach the server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start with your login details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(event) => setPassword(event.target.value.replace(/\D/g, ""))}
                minLength={8}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={rememberMe} onCheckedChange={(value) => setRememberMe(value === true)} />
              <Label>Remember me</Label>
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
