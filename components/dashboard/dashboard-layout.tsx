"use client"

import type React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth/auth-provider"
import {
  Home,
  AlertTriangle,
  MapPin,
  Users,
  Settings,
  LogOut,
  Shield,
  MessageSquare,
  FileText,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()

  const getUserMenuItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Safety Map", url: "/map", icon: MapPin },
      { title: "Community", url: "/community", icon: MessageSquare },
      { title: "Settings", url: "/settings", icon: Settings },
    ]

    if (user?.role === "user") {
      return [
        ...baseItems.slice(0, 1),
        { title: "SOS Alert", url: "/sos", icon: AlertTriangle },
        { title: "Report Incident", url: "/report", icon: FileText },
        ...baseItems.slice(1),
      ]
    }

    if (user?.role === "volunteer") {
      return [
        ...baseItems.slice(0, 1),
        { title: "SOS Monitor", url: "/sos-monitor", icon: AlertTriangle },
        { title: "Safety Reports", url: "/reports", icon: FileText },
        ...baseItems.slice(1),
      ]
    }

    if (user?.role === "admin") {
      return [
        ...baseItems.slice(0, 1),
        { title: "User Management", url: "/admin/users", icon: Users },
        { title: "Alert Monitoring", url: "/admin/alerts", icon: AlertTriangle },
        { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
        ...baseItems.slice(1),
      ]
    }

    return baseItems
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-4 py-2">
            <Shield className="h-8 w-8 text-teal-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-turquoise-600 bg-clip-text text-transparent">
              SafeHer
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {getUserMenuItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="px-4 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          {user?.role === "volunteer" && user?.isVerified && (
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Verified</span>
            </div>
          )}
        </header>

        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
