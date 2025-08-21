"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, MapPin, Clock, Eye, Search, FileText } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SafetyMap } from "@/components/maps/safety-map"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api" // Import your API client

interface IncidentReport {
  id: string
  incident_type: string
  severity: string
  latitude: number
  longitude: number
  address: string
  description: string
  status: "pending" | "investigating" | "resolved"
  created_at: string
  user_id?: string
  is_anonymous: boolean
}

export default function ReportsPage() {
  const [reports, setReports] = useState<IncidentReport[]>([])
  const [filteredReports, setFilteredReports] = useState<IncidentReport[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadReports() {
      setLoading(true)
      try {
        const res = await apiClient.getIncidentReports()
        if (res.success && res.data) {
          setReports(res.data)
          setFilteredReports(res.data)
        } else {
          throw new Error(res.error || "Failed to load incident reports")
        }
      } catch (error) {
        toast({
          title: "Load Error",
          description: "Failed to load incident reports. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [toast])

  useEffect(() => {
    let filtered = reports

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (report) =>
          report.address.toLowerCase().includes(q) ||
          report.description.toLowerCase().includes(q) ||
          report.incident_type.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((report) => report.incident_type === typeFilter)
    }
    setFilteredReports(filtered)
  }, [reports, searchQuery, statusFilter, typeFilter])

  const handleStartInvestigation = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: "investigating" as const } : report
      )
    )
    toast({
      title: "Investigation Started",
      description: "The incident report is now under investigation.",
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    })
  }

  const handleMarkResolved = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: "resolved" as const } : report
      )
    )
    toast({
      title: "Report Resolved",
      description: "The incident report has been marked as resolved.",
      className: "border-green-200 bg-green-50 text-green-800",
    })
  }

  const handleViewDetails = (report: IncidentReport) => {
    toast({
      title: "Opening Report Details",
      description: `Viewing details for ${report.incident_type} report`,
      className: "border-purple-200 bg-purple-50 text-purple-800",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="destructive">Pending</Badge>
      case "investigating":
        return <Badge className="bg-yellow-100 text-yellow-700">Investigating</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-700">Resolved</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const formatIncidentType = (type: string) => {
    return type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-navy-600">Loading incident reports...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Safety Reports</h1>
            <p className="text-navy-600">Monitor and investigate community safety reports</p>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-500" />
            <Badge className="bg-purple-100 text-purple-700">Report Management</Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reports.filter((r) => r.status === "pending").length}
              </div>
              <p className="text-xs text-red-500">Awaiting investigation</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Under Investigation</CardTitle>
              <Eye className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {reports.filter((r) => r.status === "investigating").length}
              </div>
              <p className="text-xs text-yellow-500">Currently being reviewed</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Resolved</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reports.filter((r) => r.status === "resolved").length}
              </div>
              <p className="text-xs text-green-500">Successfully handled</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Resolution Rate</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">87%</div>
              <p className="text-xs text-purple-500">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-navy-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports by location, type, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-purple-200 focus:border-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="suspicious-activity">Suspicious Activity</SelectItem>
                    <SelectItem value="unsafe-area">Unsafe Area</SelectItem>
                    <SelectItem value="poor-lighting">Poor Lighting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Report List</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reports found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className={`border-l-4 ${getSeverityColor(report.severity)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-navy-900">{formatIncidentType(report.incident_type)}</h3>
                            {getStatusBadge(report.status)}
                            <Badge variant="outline" className="capitalize">
                              {report.severity} Severity
                            </Badge>
                            {report.is_anonymous && (
                              <Badge variant="secondary" className="text-xs">
                                Anonymous
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{getTimeAgo(report.created_at)}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{report.address}</span>
                        </div>

                        <p className="text-sm text-navy-700 bg-gray-50 p-3 rounded-lg">{report.description}</p>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {report.status === "pending" && (
                          <Button size="sm" onClick={() => handleStartInvestigation(report.id)}>
                            Start Investigation
                          </Button>
                        )}
                        {report.status === "investigating" && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleMarkResolved(report.id)}
                          >
                            Mark Resolved
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(report)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Incident Report Map</CardTitle>
                <CardDescription>Geographic visualization of all incident reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <SafetyMap userRole="volunteer" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Statistics</CardTitle>
                  <CardDescription>Analysis of incident reports and resolution metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Reports This Month</span>
                      <span className="font-bold">{reports.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Resolution Time</span>
                      <span className="font-bold">4.2 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Most Common Type</span>
                      <span className="font-bold">Harassment</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Priority Reports</span>
                      <span className="font-bold">{reports.filter((r) => r.severity === "high").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Trends</CardTitle>
                  <CardDescription>Weekly resolution performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Week</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                        <span className="text-sm font-bold">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Week</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                        <span className="text-sm font-bold">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Two Weeks Ago</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                        <span className="text-sm font-bold">78%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
