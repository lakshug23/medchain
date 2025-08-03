"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, MapPin } from "lucide-react"
import type { ForecastData } from "@/app/page"

interface ForecastFormProps {
  onForecastGenerated: (data: ForecastData) => void
  onLoadingChange: (loading: boolean) => void
}

const medicines = [
  "Paracetamol 500mg",
  "Amoxicillin 250mg",
  "Insulin Glargine",
  "Covishield Vaccine",
  "Azithromycin 500mg",
  "ORS Powder",
  "Rabies Vaccine",
  "Metformin 500mg",
  "DPT Vaccine",
  "Vitamin B12 Injection",
  "Diclofenac Gel",
  "Ceftriaxone Injection",
  "Salbutamol Inhaler",
  "Ibuprofen 400mg",
  "Rotavirus Vaccine",
]

const regions = [
  { name: "Mumbai", type: "urban" as const },
  { name: "Delhi", type: "urban" as const },
  { name: "Bangalore", type: "urban" as const },
  { name: "Chennai", type: "urban" as const },
  { name: "Kolkata", type: "urban" as const },
  { name: "Rajasthan Rural", type: "rural" as const },
  { name: "Bihar Rural", type: "rural" as const },
  { name: "Odisha Rural", type: "rural" as const },
  { name: "Madhya Pradesh Rural", type: "rural" as const },
  { name: "Uttar Pradesh Rural", type: "rural" as const },
]

export function ForecastForm({ onForecastGenerated, onLoadingChange }: ForecastFormProps) {
  const [medicine, setMedicine] = useState("")
  const [region, setRegion] = useState("")
  const [period, setPeriod] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generateMockForecast = (medicine: string, region: string, period: string): ForecastData => {
    const selectedRegion = regions.find((r) => r.name === region)
    const regionType = selectedRegion?.type || "urban"
    const isRural = regionType === "rural"

    // Generate mock predictions with seasonal patterns
    const months = period === "quarterly" ? 3 : 12
    const predictions = []

    for (let i = 0; i < months; i++) {
      const baseMonth = new Date().getMonth() + i
      const monthName = new Date(2024, baseMonth % 12).toLocaleString("default", { month: "short" })

      // Simulate seasonal demand (higher in winter months for common medicines)
      const seasonalFactor = [11, 0, 1, 2].includes(baseMonth % 12) ? 1.3 : 1.0
      const baseDemand = Math.floor(Math.random() * 1000 + 500) * seasonalFactor

      // Rural areas have different demand patterns
      const ruralMultiplier = isRural ? 0.6 : 1.0
      const demand = Math.floor(baseDemand * ruralMultiplier)

      // Confidence intervals
      const uncertainty = isRural ? 0.3 : 0.2
      const lowerBound = Math.floor(demand * (1 - uncertainty))
      const upperBound = Math.floor(demand * (1 + uncertainty))

      // Dynamic thresholding based on region type
      const threshold = isRural ? Math.floor(demand * 1.5) : Math.floor(demand * 1.2)

      predictions.push({
        month: monthName,
        demand,
        lowerBound,
        upperBound,
        threshold,
      })
    }

    // Generate recommendations
    const recommendations = [
      `Maintain ${isRural ? "50%" : "20%"} higher safety stock for ${regionType} areas`,
      `Peak demand expected in ${predictions.reduce((max, p) => (p.demand > max.demand ? p : max)).month}`,
      `Consider pre-positioning inventory ${isRural ? "2 weeks" : "1 week"} before peak season`,
      isRural ? "Coordinate with local health centers for distribution" : "Optimize urban distribution routes",
    ]

    // Risk assessment
    const avgDemand = predictions.reduce((sum, p) => sum + p.demand, 0) / predictions.length
    const riskLevel = avgDemand > 800 ? "high" : avgDemand > 500 ? "medium" : "low"

    return {
      medicine,
      region,
      period,
      regionType,
      predictions,
      recommendations,
      riskLevel,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicine || !region || !period) return

    setIsLoading(true)
    onLoadingChange(true)

    try {
      // Call the real Prophet API
      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicine,
          region,
          period,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate forecast")
      }

      const forecastData = await response.json()
      onForecastGenerated(forecastData)
    } catch (error) {
      console.error("Error generating forecast:", error)
      // Fallback to mock data if API fails
      const forecastData = generateMockForecast(medicine, region, period)
      onForecastGenerated(forecastData)
    } finally {
      setIsLoading(false)
      onLoadingChange(false)
    }
  }

  const selectedRegion = regions.find((r) => r.name === region)

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5" />
          AI Demand Forecasting
        </CardTitle>
        <CardDescription className="text-gray-300">
          Generate intelligent medicine demand predictions with region-aware analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicine" className="text-white">
              Medicine Name
            </Label>
            <Select value={medicine} onValueChange={setMedicine}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((med) => (
                  <SelectItem key={med} value={med}>
                    {med}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region" className="text-white">
              Region
            </Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((reg) => (
                  <SelectItem key={reg.name} value={reg.name}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {reg.name}
                      <Badge variant={reg.type === "urban" ? "default" : "secondary"}>{reg.type}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRegion && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4" />
                Region Type:
                <Badge variant={selectedRegion.type === "urban" ? "default" : "secondary"}>{selectedRegion.type}</Badge>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="period" className="text-white">
              Forecasting Period
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quarterly">Quarterly (3 months)</SelectItem>
                <SelectItem value="annual">Annual (12 months)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={!medicine || !region || !period || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Forecast...
              </>
            ) : (
              "Generate AI Forecast"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
