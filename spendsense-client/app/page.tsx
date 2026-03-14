import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>SpendSense</CardTitle>
          <CardDescription>Track your budget and build better shopping habits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full">Login</Button>
          </Link>
          <Link href="/signup" className="block">
            <Button variant="outline" className="w-full">
              Create account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
