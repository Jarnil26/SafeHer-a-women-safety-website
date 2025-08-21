"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Camera } from "lucide-react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { apiClient } from "@/lib/api" // centralized api client

const formSchema = z.object({
  incidentType: z.string().min(2, { message: "Incident type must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  severity: z.enum(["low", "medium", "high", "critical"]),
})

export default function ReportForm() {
  const [loading, setLoading] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incidentType: "",
      location: "",
      description: "",
      severity: "medium",
    },
  })

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        toast({
          title: "Location retrieved",
          description: "Your current location has been set.",
        })
      },
      (error) => {
        toast({
          title: "Failed to get location",
          description: error.message,
          variant: "destructive",
        })
      }
    )
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (latitude === null || longitude === null) {
      toast({
        title: "Location required",
        description: "Please use the 'Get Current Location' button to set your location.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const reportData = {
        incident_type: values.incidentType,
        severity: values.severity,
        latitude: latitude,
        longitude: longitude,
        description: values.description,
        incident_time: new Date().toISOString(),
        is_anonymous: false,
        address: values.location,
      }

      const response = await apiClient.createIncidentReport(reportData)
      if (response.success) {
        toast({
          title: "Report Submitted",
          description:
            "Your incident report has been submitted successfully. Thank you for helping keep our community safe.",
          className: "border-teal-200 bg-teal-50 text-teal-800",
        })
        form.reset()
        setLatitude(null)
        setLongitude(null)
      } else {
        throw new Error(response.error || "Unknown error")
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  function handleSaveDraft() {
    toast({
      title: "Draft Saved",
      description: "Your report has been saved as a draft.",
      className: "border-purple-200 bg-purple-50 text-purple-800",
    })
  }

  function handleAddPhoto() {
    toast({
      title: "Add Photo",
      description: "Photo upload functionality would open here.",
      className: "border-turquoise-200 bg-turquoise-50 text-turquoise-800",
    })
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Report an Incident</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Incident Type */}
          <FormField
            control={form.control}
            name="incidentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Incident</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an incident type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                    <SelectItem value="unsafe_area">Unsafe Area</SelectItem>
                    <SelectItem value="poor_lighting">Poor Lighting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Please select the type of incident you are reporting.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the location name or address" {...field} />
                </FormControl>
                <FormDescription>Where did the incident occur?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" onClick={getCurrentLocation} className="mb-4">
            Use My Current Location
          </Button>
          {latitude !== null && longitude !== null && (
            <p>
              Location set: Latitude {latitude.toFixed(4)}, Longitude {longitude.toFixed(4)}
            </p>
          )}

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the incident in detail" className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Please provide a detailed description of the incident.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Severity */}
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select the severity of the incident</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex justify-between gap-2">
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
              onClick={handleSaveDraft}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-turquoise-300 text-turquoise-700 hover:bg-turquoise-50 bg-transparent flex items-center"
              onClick={handleAddPhoto}
            >
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
