"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, MapPin, Users, AlertTriangle, Phone, Heart, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ConnectionStatus } from "@/components/ui/connection-status"

export function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: AlertTriangle,
      title: "SOS Alert System",
      description: "Instant emergency alerts with GPS location sharing to trusted contacts and volunteers.",
      color: "text-red-500",
    },
    {
      icon: MapPin,
      title: "Safety Map",
      description: "Real-time safety zones, risk areas, and incident reports to help you navigate safely.",
      color: "text-blue-500",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with volunteers and community members for support and safety tips.",
      color: "text-purple-500",
    },
    {
      icon: Shield,
      title: "Anonymous Reporting",
      description: "Report incidents anonymously to help create safer communities for everyone.",
      color: "text-teal-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "University Student",
      content: "SafeHer gives me confidence when walking alone at night. The SOS feature is incredibly reassuring.",
      rating: 5,
    },
    {
      name: "Maria Rodriguez",
      role: "Working Professional",
      content: "The community support and safety map have been invaluable. I feel more connected and safer.",
      rating: 5,
    },
    {
      name: "Dr. Emily Chen",
      role: "Healthcare Worker",
      content: "As someone who works late shifts, this app provides peace of mind for me and my family.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              SafeHer
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-600 hover:text-teal-600">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-teal-100 to-purple-100 text-teal-700 border-teal-200">
              <Heart className="h-3 w-3 mr-1" />
              Empowering Women's Safety
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-purple-600 to-navy-700 bg-clip-text text-transparent leading-tight">
              Your Safety,
              <br />
              Our Priority
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join a community-driven platform designed to enhance women's safety through real-time alerts, community
              support, and smart safety features.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
                >
                  Start Your Safety Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-teal-200 text-teal-700 hover:bg-teal-50 px-8 py-3 bg-transparent"
                >
                  Sign In to Continue
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-800">Comprehensive Safety Features</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to stay safe, connected, and empowered in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                  activeFeature === index
                    ? "border-teal-200 shadow-lg scale-105"
                    : "border-slate-100 hover:border-teal-100"
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-purple-100 flex items-center justify-center`}
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl text-slate-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-800">Trusted by Women Everywhere</h2>
            <p className="text-xl text-slate-600">Real stories from our community members</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-teal-600">{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-500 to-purple-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Take Control of Your Safety?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of women who trust SafeHer for their daily safety needs.
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-slate-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-3"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">SafeHer</span>
              </div>
              <p className="text-slate-400">Empowering women through technology and community support.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-slate-400">
                <li>SOS Alerts</li>
                <li>Safety Map</li>
                <li>Community Support</li>
                <li>Anonymous Reporting</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Safety Tips</li>
                <li>Contact Us</li>
                <li>Emergency Contacts</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Emergency</h3>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>911 - Emergency</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>988 - Crisis Hotline</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 SafeHer. All rights reserved. Built with care for women's safety.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
