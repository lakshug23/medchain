"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar } from "lucide-react"
import { useState, useEffect } from "react"

interface HistoricalDataProps {
  selectedMedicine?: string
  selectedRegion?: string
}

// Generate historical data based on selected medicine and region
const generateHistoricalData = (medicine?: string, region?: string) => {
  const baseData = [
    { month: "Jan", actual: 850, predicted: 820 },
    { month: "Feb", actual: 920, predicted: 890 },
    { month: "Mar", actual: 780, predicted: 800 },
    { month: "Apr", actual: 650, predicted: 680 },
    { month: "May", actual: 720, predicted: 700 },
    { month: "Jun", actual: 890, predicted: 870 },
    { month: "Jul", actual: 950, predicted: 920 },
    { month: "Aug", actual: 1100, predicted: 1080 },
    { month: "Sep", actual: 980, predicted: 1000 },
    { month: "Oct", actual: 1200, predicted: 1150 },
    { month: "Nov", actual: 1350, predicted: 1320 },
    { month: "Dec", actual: 1450, predicted: 1400 },
  ]

  // Adjust data based on medicine and region if selected
  if (medicine && region) {
    const regionMultiplier = region.toLowerCase().includes("rural") ? 0.6 : 1.0
    const medicineMultiplier = medicine === "Paracetamol" ? 1.2 : medicine === "Insulin" ? 0.8 : 1.0

    return baseData.map((item) => ({
      ...item,
      actual: Math.floor(item.actual * regionMultiplier * medicineMultiplier),
      predicted: Math.floor(item.predicted * regionMultiplier * medicineMultiplier),
    }))
  }

  return baseData
}

export function HistoricalData({ selectedMedicine, selectedRegion }: HistoricalDataProps) {
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedMedicine && selectedRegion) {
      setLoading(true)
      fetch("/api/historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicine: selectedMedicine,
          region: selectedRegion,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setHistoricalData(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching historical data:", err)
          setHistoricalData(generateHistoricalData(selectedMedicine, selectedRegion))
          setLoading(false)
        })
    }
  }, [selectedMedicine, selectedRegion])

  const title =
    selectedMedicine && selectedRegion
      ? `Historical Forecast Accuracy - ${selectedMedicine} in ${selectedRegion}`
      : "Historical Forecast Accuracy"

  const description =
    selectedMedicine && selectedRegion
      ? `Comparison of predicted vs actual demand for ${selectedMedicine} in ${selectedRegion} over the past 12 months`
      : "Select a medicine and region to view specific historical data"

  return (
    <div className="space-y-6">
      {/* Forecast Accuracy */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription className="text-gray-300">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedMedicine && selectedRegion ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      const label =
                        name === "actual" ? "Actual Demand" : name === "predicted" ? "Predicted Demand" : name
                      return [`${value} units`, label]
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual Demand" />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Predicted Demand"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-300">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No specific selection made</p>
              <p className="text-sm">
                Please generate a forecast first to view historical data for that medicine and region
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
