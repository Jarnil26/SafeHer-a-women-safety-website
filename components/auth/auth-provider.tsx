"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient, mockApi, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isOnline: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
  role?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check backend connection and load user
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if backend is available
        const backendOnline = await apiClient.healthCheck()
        console.log("✅ Backend Online:", backendOnline)
        setIsOnline(backendOnline)

        // Try to get user profile
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

        if (token) {
          let response
          if (backendOnline) {
            response = await apiClient.getProfile()
          } else {
            // Use mock data in offline mode
            response = await mockApi.getProfile()
          }

          if (response.success && response.data) {
            setUser(response.data)
          } else {
            // Clear invalid token
            if (typeof window !== "undefined") {
              localStorage.removeItem("access_token")
              localStorage.removeItem("refresh_token")
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        // Clear tokens on error
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      let response
      if (isOnline) {
        response = await apiClient.login(email, password)
      } else {
        response = await mockApi.login(email, password)
      }

      if (response.success && response.data) {
        setUser(response.data.user)

        if (!isOnline) {
          // Store mock token for offline mode
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", response.data.access)
            localStorage.setItem("refresh_token", response.data.refresh)
          }
        }

        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.name}!`,
        })

        router.push("/dashboard")
        return true
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Invalid credentials",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true)

      let response
      if (isOnline) {
        response = await apiClient.register(userData)
      } else {
        response = await mockApi.register(userData)
      }

      if (response.success && response.data) {
        setUser(response.data.user)

        if (!isOnline) {
          // Store mock token for offline mode
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", response.data.access)
            localStorage.setItem("refresh_token", response.data.refresh)
          }
        }

        toast({
          title: "Registration Successful",
          description: `Welcome to SafeHer, ${response.data.user.name}!`,
        })

        router.push("/dashboard")
        return true
      } else {
        toast({
          title: "Registration Failed",
          description: response.error || "Failed to create account",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.clearToken()

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })

    router.push("/")
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false

      let response
      if (isOnline) {
        response = await apiClient.updateProfile(userData)
      } else {
        // Mock update for offline mode
        await new Promise((resolve) => setTimeout(resolve, 500))
        const updatedUser = { ...user, ...userData }
        setUser(updatedUser)

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
        return true
      }

      if (response.success && response.data) {
        setUser(response.data)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
        return true
      } else {
        toast({
          title: "Update Failed",
          description: response.error || "Failed to update profile",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isOnline,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
