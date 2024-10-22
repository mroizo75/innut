"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/actions/reset-password"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passordene stemmer ikke overens")
      return
    }
    if (!token) {
      setError("Ugyldig token")
      return
    }
    try {
      const result = await resetPassword(token, password)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(result.success)
        setTimeout(() => router.push("/auth/login"), 3000)
      }
    } catch (error) {
      setError("Noe gikk galt")
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nytt passord"
        required
      />
      <Input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Bekreft passord"
        required
      />
      <Button type="submit">Sett passord</Button>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </form>
  )
}