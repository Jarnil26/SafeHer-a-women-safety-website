"use client";

import { useState } from "react";
import { Phone, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SOSButton } from "@/components/safety/sos-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function SosPage() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [currentAlertId, setCurrentAlertId] = useState<string | null>(null); // Store alert ID after creation
  const { toast } = useToast();

  const handleSOSAlert = async () => {
    setIsSOSActive(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await apiClient.createSOSAlert({
            latitude,
            longitude,
            message: "Urgent help needed",
            priority: "high",
          });

          if (response.success) {
            toast({
              title: "SOS Alert Activated!",
              description: "Your location has been shared. Help is on the way.",
              className: "border-red-200 bg-red-50 text-red-800",
            });
            // Save the alert ID for resolution later
            setCurrentAlertId(response.data?.alert?.id || null);
          } else {
            toast({
              title: "Failed to Activate SOS",
              description: response.error || "Try again later.",
              variant: "destructive",
            });
          }
        },
        () => {
          toast({
            title: "Location Error",
            description: "Please enable location permissions to send SOS.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleMarkResolved = async () => {
    if (!currentAlertId) {
      toast({
        title: "No Active Alert",
        description: "No SOS alert to resolve.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiClient.resolveSOSAlert(currentAlertId);
      if (response.success) {
        toast({
          title: "SOS Alert Resolved",
          description: "Thank you for confirming your safety!",
          className: "border-green-200 bg-green-50 text-green-800",
        });
        setIsSOSActive(false);
        setCurrentAlertId(null);
      } else {
        toast({
          title: "Failed to Resolve",
          description: response.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Resolve error:", error);
      toast({
        title: "Error",
        description: "Unable to resolve alert at this time.",
        variant: "destructive",
      });
    }
  };

  const handleQuickCall = (number: string, service: string) => {
    toast({
      title: `Calling ${service}`,
      description: `Dialing ${number}...`,
      className: "border-turquoise-200 bg-turquoise-50 text-turquoise-800",
    });
    window.open(`tel:${number}`);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          toast({
            title: "Location Shared",
            description: "Your location has been shared with emergency contacts.",
            className: "border-teal-200 bg-teal-50 text-teal-800",
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleFakeCall = () => {
    toast({
      title: "Fake Call Started",
      description: "Simulating an incoming call to help you exit safely.",
      className: "border-purple-200 bg-purple-50 text-purple-800",
    });
  };

  function handleActivate(): void {
    handleSOSAlert();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 via-purple-900 to-gray-900 px-4 py-10 text-white space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-white mb-6 tracking-wide">
          SOS Emergency
        </h1>

        <SOSButton onActivate={handleActivate} />

        {isSOSActive && (
          <Button
            onClick={handleMarkResolved}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Mark as Resolved
          </Button>
        )}

        <p className="text-sm text-gray-300 mt-6">
          Your alert will be sent to all nearby verified volunteers and
          authorities.
        </p>
      </div>

      {/* Optional other emergency contact buttons etc. below */}

    </div>
  );
}
