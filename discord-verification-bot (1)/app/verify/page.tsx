"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const guildId = searchParams.get("guild")
  const userId = searchParams.get("user")

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    agreeToRules: false,
    captchaAnswer: "",
    captchaQuestion: "",
    captchaCorrect: 0,
  })

  useEffect(() => {
    // Generate simple math captcha
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setFormData((prev) => ({
      ...prev,
      captchaQuestion: `${num1} + ${num2}`,
      captchaCorrect: num1 + num2,
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate captcha
      if (Number.parseInt(formData.captchaAnswer) !== formData.captchaCorrect) {
        throw new Error("Incorrect captcha answer")
      }

      if (!formData.agreeToRules) {
        throw new Error("You must agree to the server rules")
      }

      if (!formData.email || !formData.email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      // Submit verification
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId,
          userId,
          email: formData.email,
          timestamp: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Verification failed")
      }

      setVerified(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-700 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white font-montserrat">Verification Complete!</CardTitle>
            <CardDescription className="text-gray-300 font-open-sans">
              You have been successfully verified and should now have access to the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-400 mb-4 font-open-sans">
              You can now close this page and return to Discord.
            </p>
            <Button onClick={() => window.close()} className="bg-green-700 hover:bg-green-600 text-white">
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-700 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white font-montserrat">Server Verification</CardTitle>
          <CardDescription className="text-gray-300 font-open-sans">
            Complete the verification process to gain access to the server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-400 font-open-sans">
                Used for verification purposes only. We won't spam you.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha" className="text-gray-300">
                Security Check
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">What is {formData.captchaQuestion}?</span>
                <Input
                  id="captcha"
                  type="number"
                  placeholder="Answer"
                  value={formData.captchaAnswer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, captchaAnswer: e.target.value }))}
                  className="w-20 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rules"
                checked={formData.agreeToRules}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToRules: checked as boolean }))}
              />
              <Label htmlFor="rules" className="text-sm text-gray-300 font-open-sans">
                I agree to follow the server rules and community guidelines
              </Label>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Complete Verification"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
