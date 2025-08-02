import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, MapPin } from "lucide-react";

export function SeasonalDemand({ selectedMedicine, selectedRegion }) {
  const [seasonalData, setSeasonalData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate seasonal data based on selected medicine and region
  const generateSeasonalData = (medicine, region) => {
    let baseData = [
      { name: "Winter", value: 176, color: "#3b82f6" },
      { name: "Summer", value: 134, color: "#f59e0b" },
      { name: "Monsoon", value: 185, color: "#10b981" },
      { name: "Post-Monsoon", value: 120, color: "#8b5cf6" },
    ];

    if (medicine && region) {
      // Adjust seasonal patterns based on medicine type and region
      const regionMultiplier = region.toLowerCase().includes("rural") ? 0.7 : 1.0;

      // Different medicines have different seasonal patterns
      if (medicine === "Paracetamol") {
        // Higher demand in winter and monsoon
        baseData = baseData.map((season) => ({
          ...season,
          value:
            season.name === "Winter" || season.name === "Monsoon"
              ? Math.floor(season.value * 1.3 * regionMultiplier)
              : Math.floor(season.value * 0.8 * regionMultiplier),
        }));
      } else if (medicine === "Insulin") {
        // More consistent demand across seasons
        baseData = baseData.map((season) => ({
          ...season,
          value: Math.floor(season.value * 0.9 * regionMultiplier),
        }));
      } else {
        // Default adjustment
        baseData = baseData.map((season) => ({
          ...season,
          value: Math.floor(season.value * regionMultiplier),
        }));
      }
    }

    return baseData;
  };

  useEffect(() => {
    if (selectedMedicine && selectedRegion) {
      setLoading(true);
      // Simulate API call with mock data
      setTimeout(() => {
        const data = generateSeasonalData(selectedMedicine, selectedRegion);
        setSeasonalData(data);
        setLoading(false);
      }, 500);
    }
  }, [selectedMedicine, selectedRegion]);

  const totalDemand = seasonalData.reduce((sum, item) => sum + item.value, 0);

  const title = selectedMedicine && selectedRegion 
    ? `Seasonal Demand Pattern - ${selectedMedicine}` 
    : "Seasonal Demand Pattern";

  const description = selectedMedicine && selectedRegion
    ? `Seasonal distribution for ${selectedMedicine} in ${selectedRegion}`
    : "Select a medicine and region to view specific seasonal patterns";

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Loading Seasonal Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seasonal Demand Distribution */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 text-gray-300">
            {selectedMedicine && selectedRegion && (
              <>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedRegion}
                </span>
                <Badge variant={selectedRegion.toLowerCase().includes("rural") ? "secondary" : "default"}>
                  {selectedRegion.toLowerCase().includes("rural") ? "Rural" : "Urban"} Area
                </Badge>
              </>
            )}
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedMedicine && selectedRegion ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={seasonalData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={1000}
                      animationBegin={0}
                    >
                      {seasonalData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Seasonal Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Seasonal Breakdown</h3>
                <div className="space-y-3">
                  {seasonalData.map((season, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm" 
                          style={{ backgroundColor: season.color }}
                        />
                        <span className="font-medium text-white">{season.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg text-white">{season.value} units</div>
                        <div className="text-sm text-gray-300">
                          {((season.value / totalDemand) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Annual Demand */}
                <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-400/30">
                  <div className="text-sm font-medium text-blue-200">Total Annual Demand</div>
                  <div className="text-2xl font-bold text-white">{totalDemand} units</div>
                  <div className="text-sm text-blue-300">
                    For {selectedMedicine} in {selectedRegion}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-300">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No specific selection made</p>
              <p className="text-sm">
                Please generate a forecast first to view seasonal demand patterns for that medicine and region
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 