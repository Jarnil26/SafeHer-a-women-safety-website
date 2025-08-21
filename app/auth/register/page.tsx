"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Shield, Eye, EyeOff, Sparkles, Lock, Mail, User, UserCheck } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const success = await register(formData)

    if (success) {
      toast({
        title: "Registration successful",
        description:
          formData.role === "volunteer" ? "Your account is pending admin verification" : "Welcome to SafeHer!",
      })
      router.push("/dashboard")
    } else {
      toast({
        title: "Registration failed",
        description: "Please try again",
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
            Join SafeHer
          </CardTitle>
          <CardDescription className="text-navy-600 text-lg">Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-navy-700 font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-navy-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-navy-700 font-medium">
                Role
              </Label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500 z-10" />
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (Women seeking safety)</SelectItem>
                    <SelectItem value="volunteer">Volunteer (Help others)</SelectItem>
                  </SelectContent>
                </Select>
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pl-10 pr-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                  placeholder="Create a password"
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-navy-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="pl-10 pr-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-700 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-turquoise-500 hover:from-teal-600 hover:to-turquoise-600 transform hover:scale-105 transition-all duration-300 shadow-lg text-lg py-6"
              disabled={loading || !formData.role}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-navy-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline transition-all duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
