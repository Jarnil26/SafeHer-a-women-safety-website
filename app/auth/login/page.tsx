"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Shield, Eye, EyeOff, Sparkles, Lock, Mail } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const success = await login(email, password)

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back to SafeHer!",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-teal-200 rounded-full opacity-10 animate-float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-28 h-28 bg-turquoise-200 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-20 h-20 bg-navy-200 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <Card
        className={`w-full max-w-md glass-effect border-white/20 shadow-2xl transition-all duration-1000 ${isVisible ? "animate-bounce-in" : "opacity-0 scale-75"}`}
      >
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4 relative">
            <div className="relative">
              <Shield className="h-16 w-16 text-teal-600 animate-pulse-glow" />
              <Sparkles className="h-6 w-6 text-purple-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-navy-600 text-lg">Sign in to your SafeHer account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-navy-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-navy-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-700 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-turquoise-500 hover:from-teal-600 hover:to-turquoise-600 transform hover:scale-105 transition-all duration-300 shadow-lg text-lg py-6"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-gradient-to-r from-teal-50 to-turquoise-50 rounded-lg border border-teal-200">
            <p className="text-navy-600 text-center font-medium mb-2">Demo accounts:</p>
            <div className="text-xs text-navy-500 space-y-1">
              <p className="bg-white/50 p-2 rounded">
                <strong>Admin:</strong> admin@safeguard.com / admin123
              </p>
              <p className="bg-white/50 p-2 rounded">
                <strong>Volunteer:</strong> volunteer@safeguard.com / volunteer123
              </p>
              <p className="bg-white/50 p-2 rounded">
                <strong>User:</strong> user@safeguard.com / user123
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-navy-600">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-all duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
