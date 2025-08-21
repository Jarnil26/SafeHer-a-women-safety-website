"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  MapPin,
  Users,
  Clock,
  Shield,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "./dashboard-layout";
import { SafetyMap } from "@/components/maps/safety-map";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface SOSAlert {
  id: string;
  userName: string;
  location: string;
  timestamp: string;
  status: "active" | "responded" | "resolved";
  priority: "high" | "medium" | "low";
}

export function VolunteerDashboard() {
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>([]);

  const [activeResponses, setActiveResponses] = useState(3);
  const [totalHelped, setTotalHelped] = useState(47);
  const { toast } = useToast();

  const handleViewSOSMonitor = () => {
    window.location.href = "/sos-monitor";
  };

  const handleViewReports = () => {
    window.location.href = "/reports";
  };

  const handleViewMap = () => {
    window.location.href = "/map";
  };

  const handleRespondToAlert = async (alertId: string) => {
    try {
      const response = await apiClient.respondToSOSAlert(alertId);
      if (response.success) {
        setSOSAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, status: "responded" as const }
              : alert
          )
        );
        setActiveResponses((prev) => prev + 1);
        toast({
          title: "Response Sent",
          description: "You're now responding to this emergency alert",
        });
      } else {
        toast({ title: "Failed to respond", description: response.error });
      }
    } catch (err) {
      console.error("Respond error:", err);
      toast({ title: "Error", description: "Unable to respond to alert." });
    }
  };

  // const handleResolveAlert = async (alertId: string) => {
  //   try {
  //     const response = await apiClient.resolveSOSAlert(alertId);
  //     if (response.success) {
  //       setSOSAlerts((prev) =>
  //         prev.map((alert) =>
  //           alert.id === alertId
  //             ? { ...alert, status: "resolved" as const }
  //             : alert
  //         )
  //       );
  //       setTotalHelped((prev) => prev + 1);
  //       toast({
  //         title: "Alert Resolved",
  //         description: "Thank you for helping keep our community safe!",
  //       });
  //     } else {
  //       toast({ title: "Failed to resolve", description: response.error });
  //     }
  //   } catch (err) {
  //     console.error("Resolve error:", err);
  //     toast({ title: "Error", description: "Unable to resolve alert." });
  //   }
  // };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>;
      case "responded":
        return <Badge variant="secondary">Responding</Badge>;
      case "resolved":
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  useEffect(() => {
    const fetchSOSAlerts = async () => {
      try {
        const response = await apiClient.getSOSAlerts();

        if (
          response.success &&
          response.data &&
          Array.isArray(response.data.alerts)
        ) {
          const formattedData = response.data.alerts.map((alert: any) => ({
            id:
              alert.id ||
              alert._id ||
              alert._id?.$oid ||
              Math.random().toString(),
            userName: alert.user_name || "Anonymous",
            location: alert.address || "Unknown Location",
            timestamp: alert.created_at || "Just now",
            status: alert.status || "active",
            priority: alert.priority || "medium",
          }));
          setSOSAlerts(formattedData);
        } else {
          console.error(
            "Failed to fetch SOS alerts: Unexpected response",
            response
          );
        }
      } catch (err) {
        console.error("Error fetching SOS alerts:", err);
      }
    };

    fetchSOSAlerts();
    const interval = setInterval(fetchSOSAlerts, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">
              Volunteer Dashboard
            </h1>
            <p className="text-navy-600">
              Monitor and respond to safety alerts in your area
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-teal-500" />
            <Badge className="bg-teal-100 text-teal-700 border-teal-200">
              Verified Volunteer
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={handleViewSOSMonitor}
            >
              SOS Monitor
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
              onClick={handleViewReports}
            >
              View Reports
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">
                Active Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {sosAlerts.filter((a) => a.status === "active").length}
              </div>
              <p className="text-xs text-red-500">Requiring response</p>
            </CardContent>
          </Card>

          <Card className="border-turquoise-200 bg-turquoise-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-turquoise-700">
                Active Responses
              </CardTitle>
              <Clock className="h-4 w-4 text-turquoise-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-turquoise-600">
                {activeResponses}
              </div>
              <p className="text-xs text-turquoise-500">Currently responding</p>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-teal-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">
                People Helped
              </CardTitle>
              <Users className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                {totalHelped}
              </div>
              <p className="text-xs text-teal-500">Total this month</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Response Time
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">3.2m</div>
              <p className="text-xs text-purple-500">Average response</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Map */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Real-time Safety Map</CardTitle>
              <CardDescription>
                Live SOS alerts and volunteer locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <SafetyMap userRole="volunteer" />
              </div>
            </CardContent>
          </Card>

          {/* SOS Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>SOS Alerts</CardTitle>
              <CardDescription>
                Emergency alerts requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {sosAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(
                            alert.priority
                          )}`}
                        ></div>
                        <span className="font-medium">{alert.userName}</span>
                        {getStatusBadge(alert.status)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {alert.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{alert.location}</span>
                    </div>

                    <div className="flex space-x-2">
                      {alert.status === "active" && (
                        <Button
                          size="sm"
                          onClick={() => handleRespondToAlert(alert.id)}
                          className="flex-1"
                        >
                          Respond
                        </Button>
                      )}
                      {/* {alert.status === "responded" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                          className="flex-1"
                        >
                          Mark Resolved
                        </Button>
                      )} */}
                      {alert.status === "responded" && (
                        <Badge variant="secondary">Responding</Badge>
                      )}
          
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleViewSOSMonitor}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Volunteer Activity</CardTitle>
            <CardDescription>
              Your recent responses and community contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Responded to SOS alert in Downtown
                  </p>
                  <p className="text-xs text-gray-500">30 minutes ago</p>
                </div>
                <Badge variant="secondary">Resolved</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Reported unsafe area near Central Park
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <Badge variant="secondary">Submitted</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Joined safety patrol group
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
