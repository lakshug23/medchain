import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select-functional";
import { Badge } from "./ui/badge";

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
];

const regions = [
  { name: "Mumbai", type: "urban" },
  { name: "Delhi", type: "urban" },
  { name: "Bangalore", type: "urban" },
  { name: "Chennai", type: "urban" },
  { name: "Kolkata", type: "urban" },
  { name: "Rajasthan Rural", type: "rural" },
  { name: "Bihar Rural", type: "rural" },
  { name: "Odisha Rural", type: "rural" },
  { name: "Madhya Pradesh Rural", type: "rural" },
  { name: "Uttar Pradesh Rural", type: "rural" },
];

export function ForecastForm({ onForecastGenerated, onLoadingChange }) {
  const [medicine, setMedicine] = useState("");
  const [region, setRegion] = useState("");
  const [period, setPeriod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateMockForecast = (medicine, region, period) => {
    const selectedRegion = regions.find((r) => r.name === region);
    const regionType = selectedRegion?.type || "urban";
    const isRural = regionType === "rural";

    // Generate mock predictions with seasonal patterns
    const months = period === "quarterly" ? 3 : 12;
    const predictions = [];

    for (let i = 0; i < months; i++) {
      const baseMonth = new Date().getMonth() + i;
      const monthName = new Date(2024, baseMonth % 12).toLocaleString("default", { month: "short" });

      // Simulate seasonal demand (higher in winter months for common medicines)
      const seasonalFactor = [11, 0, 1, 2].includes(baseMonth % 12) ? 1.3 : 1.0;
      const baseDemand = Math.floor(Math.random() * 1000 + 500) * seasonalFactor;

      // Rural areas have different demand patterns
      const ruralMultiplier = isRural ? 0.6 : 1.0;
      const demand = Math.floor(baseDemand * ruralMultiplier);

      // Confidence intervals
      const uncertainty = isRural ? 0.3 : 0.2;
      const lowerBound = Math.floor(demand * (1 - uncertainty));
      const upperBound = Math.floor(demand * (1 + uncertainty));

      // Dynamic thresholding based on region type
      const threshold = isRural ? Math.floor(demand * 1.5) : Math.floor(demand * 1.2);

      predictions.push({
        month: monthName,
        demand,
        lowerBound,
        upperBound,
        threshold,
      });
    }

    // Generate recommendations
    const recommendations = [
      `Maintain ${isRural ? "50%" : "20%"} higher safety stock for ${regionType} areas`,
      `Peak demand expected in ${predictions.reduce((max, p) => (p.demand > max.demand ? p : max)).month}`,
      `Consider pre-positioning inventory ${isRural ? "2 weeks" : "1 week"} before peak season`,
      isRural ? "Coordinate with local health centers for distribution" : "Optimize urban distribution routes",
    ];

    // Risk assessment
    const avgDemand = predictions.reduce((sum, p) => sum + p.demand, 0) / predictions.length;
    const riskLevel = avgDemand > 800 ? "high" : avgDemand > 500 ? "medium" : "low";

    return {
      medicine,
      region,
      period,
      regionType,
      predictions,
      recommendations,
      riskLevel,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medicine || !region || !period) return;

    setIsLoading(true);
    onLoadingChange(true);

    // Simulate API call delay
    setTimeout(() => {
      const forecast = generateMockForecast(medicine, region, period);
      onForecastGenerated(forecast);
      setIsLoading(false);
      onLoadingChange(false);
    }, 2000);
  };

  const selectedRegion = regions.find((r) => r.name === region);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🧠 AI-Powered Drug Demand Forecasting
        </CardTitle>
        <CardDescription className="text-white/70">
          Generate intelligent predictions for pharmaceutical demand across different regions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="medicine" className="text-white">Medicine</Label>
              <Select value={medicine} onValueChange={setMedicine}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white w-full">
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {medicines.map((med) => (
                    <SelectItem key={med} value={med} className="text-white hover:bg-slate-700">
                      {med}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-white flex items-center gap-2">
                📍 Region
                {selectedRegion && (
                  <Badge variant={selectedRegion.type === "urban" ? "default" : "secondary"}>
                    {selectedRegion.type}
                  </Badge>
                )}
              </Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white w-full">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {regions.map((reg) => (
                    <SelectItem key={reg.name} value={reg.name} className="text-white hover:bg-slate-700">
                      {reg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period" className="text-white">Forecast Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white w-full">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="quarterly" className="text-white hover:bg-slate-700">
                  Quarterly (3 months)
                </SelectItem>
                <SelectItem value="annual" className="text-white hover:bg-slate-700">
                  Annual (12 months)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={!medicine || !region || !period || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isLoading ? (
              <>
                ⏳ Generating Forecast...
              </>
            ) : (
              <>
                🚀 Generate AI Forecast
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
