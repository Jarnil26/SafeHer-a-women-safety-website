const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://safehernow.onrender.com/api"

// API Response types
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface User {
  id: string
  email: string
  name: string
  role: "user" | "volunteer" | "admin"
  phone?: string
  is_verified: boolean
  emergency_contacts: string[]
  share_location: boolean
  anonymous_reporting: boolean
}

interface LoginResponse {
  access: string
  refresh: string
  user: User
}

// API Client class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Authentication APIs
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/accounts/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      this.setToken(response.data.access)
      if (typeof window !== "undefined") {
        localStorage.setItem("refresh_token", response.data.refresh)
      }
    }

    return response
  }

  async register(userData: {
    email: string
    password: string
    name: string
    phone?: string
    role?: string
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/accounts/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.success && response.data) {
      this.setToken(response.data.access)
      if (typeof window !== "undefined") {
        localStorage.setItem("refresh_token", response.data.refresh)
      }
    }

    return response
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/accounts/profile/")
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/accounts/profile/", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  // SOS Alert APIs
  async createSOSAlert(alertData: {
    latitude: number
    longitude: number
    message?: string
    priority?: string
  }): Promise<ApiResponse<any>> {
    return this.request("/safety/sos-alerts/", {
      method: "POST",
      body: JSON.stringify(alertData),
    })
  }

  // Inside ApiClient class
async getSOSAlerts(): Promise<ApiResponse<{alerts: any[]}>> {
  return this.request("/safety/sos-alerts/list/");
}
async respondToSOSAlert(alertId: string): Promise<ApiResponse<{alerts: any[]}>> {
  return this.request(`/safety/sos/${alertId}/respond/`, {
    method: "POST",
  });
}

async resolveSOSAlert(alertId: string): Promise<ApiResponse<{alerts: any[]}>> {
  return this.request(`/safety/sos/${alertId}/resolve/`, {
    method: "POST",
  });
}


  async updateSOSAlert(alertId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/safety/sos-alerts/${alertId}/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }

  //safe stats
  // Add this method inside class ApiClient
async getSafetyStats(): Promise<ApiResponse<any>> {
  return this.request("/safety/stats/")
}


  // Incident Report APIs
async createIncidentReport(reportData: {
  incident_type: string
  severity: string
  description: string
  incident_time: string
  is_anonymous?: boolean
  latitude?: number    // made optional
  longitude?: number   // made optional
}): Promise<ApiResponse<any>> {
  return this.request("/safety/reports/create/", {
    method: "POST",
    body: JSON.stringify(reportData),
  })
}


  async getIncidentReports(): Promise<ApiResponse<any[]>> {
    return this.request("/safety/reports/")
  }

  // Map Data APIs
  async getMapData(): Promise<
    ApiResponse<{
      safe_zones: any[]
      risk_zones: any[]
      recent_incidents: any[]
    }>
  > {
    return this.request("/safety/map-data/")
  }

  // Community APIs
  async getCommunityPosts(): Promise<ApiResponse<any[]>> {
    return this.request("/community/posts/")
  }

  async createCommunityPost(postData: {
    title?: string
    content: string
    category: string
  }): Promise<ApiResponse<any>> {
    return this.request("/community/posts/", {
      method: "POST",
      body: JSON.stringify(postData),
    })
  }

  async getAnnouncements(): Promise<ApiResponse<any[]>> {
    return this.request("/community/announcements/")
  }

  async updateLocation(latitude: number, longitude: number): Promise<ApiResponse<any>> {
  return this.request("/accounts/update-location/", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude }),
  })
}

}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);


// Mock data for offline mode
const mockUser: User = {
  id: "1",
  email: "user@safeguard.com",
  name: "Demo User",
  role: "user",
  phone: "+1234567890",
  is_verified: true,
  emergency_contacts: ["+1234567891", "+1234567892"],
  share_location: true,
  anonymous_reporting: false,
}

const mockAdminUser: User = {
  id: "2",
  email: "admin@safeguard.com",
  name: "Admin User",
  role: "admin",
  phone: "+1234567893",
  is_verified: true,
  emergency_contacts: ["+1234567894"],
  share_location: true,
  anonymous_reporting: false,
}

const mockVolunteerUser: User = {
  id: "3",
  email: "volunteer@safeguard.com",
  name: "Volunteer User",
  role: "volunteer",
  phone: "+1234567895",
  is_verified: true,
  emergency_contacts: ["+1234567896"],
  share_location: true,
  anonymous_reporting: false,
}

// Mock API functions for offline mode
export const mockApi = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

    let user: User
    if (email === "admin@safeguard.com" && password === "admin123") {
      user = mockAdminUser
    } else if (email === "volunteer@safeguard.com" && password === "volunteer123") {
      user = mockVolunteerUser
    } else if (email === "user@safeguard.com" && password === "user123") {
      user = mockUser
    } else {
      return {
        success: false,
        error: "Invalid credentials",
      }
    }

    return {
      success: true,
      data: {
        access: "mock_access_token",
        refresh: "mock_refresh_token",
        user,
      },
    }
  },

  async register(userData: any): Promise<ApiResponse<LoginResponse>> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      role: userData.role || "user",
      phone: userData.phone,
      is_verified: false,
      emergency_contacts: [],
      share_location: true,
      anonymous_reporting: false,
    }

    return {
      success: true,
      data: {
        access: "mock_access_token",
        refresh: "mock_refresh_token",
        user: newUser,
      },
    }
  },

  async getProfile(): Promise<ApiResponse<User>> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      success: true,
      data: mockUser,
    }
  },

  async healthCheck(): Promise<boolean> {
    return false // Always return false for mock API
  },
}

export type { User, LoginResponse, ApiResponse }
