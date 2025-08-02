import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { CheckCircle, MapPin, Calendar } from "lucide-react";

// Generate historical data based on selected medicine and region
const generateHistoricalData = (medicine, region) => {
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
  ];

  // Adjust data based on medicine and region if selected
  if (medicine && region) {
    const regionMultiplier = region.toLowerCase().includes("rural") ? 0.6 : 1.0;
    const medicineMultiplier = medicine === "Paracetamol" ? 1.2 : medicine === "Insulin" ? 0.8 : 1.0;

    return baseData.map((item) => ({
      ...item,
      actual: Math.floor(item.actual * regionMultiplier * medicineMultiplier),
      predicted: Math.floor(item.predicted * regionMultiplier * medicineMultiplier),
    }));
  }

  return baseData;
};

export function ForecastResults({ data, isLoading }) {
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    if (data?.medicine && data?.region) {
      setHistoricalData(generateHistoricalData(data.medicine, data.region));
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Generating Forecast...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Forecast Results</CardTitle>
          <CardDescription className="text-white/70">
            Select medicine, region, and period to generate AI-powered demand predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-white/70">
            <div className="text-6xl mb-4">📈</div>
            <p>No forecast data available. Please generate a forecast first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const peakDemand = Math.max(...data.predictions.map(p => p.demand));
  const averageDemand = Math.round(data.predictions.reduce((sum, p) => sum + p.demand, 0) / data.predictions.length);
  const peakMonth = data.predictions.find(p => p.demand === peakDemand)?.month || "Unknown";

  return (
    <div className="space-y-6">
      {/* Historical Forecast Accuracy */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Historical Forecast Accuracy - {data.medicine} in {data.region}
          </CardTitle>
          <CardDescription className="text-gray-300">
            Comparison of predicted vs actual demand for {data.medicine} in {data.region} over the past 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="white"
                  fontSize={12}
                  tick={{ fill: 'white' }}
                />
                <YAxis 
                  stroke="white"
                  fontSize={12}
                  tick={{ fill: 'white' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value, name) => {
                    const label = name === "actual" ? "Actual Demand" : "Predicted Demand";
                    return [`${value} units`, label];
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: 'white' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  name="Actual Demand"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Predicted Demand"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Controls Panel */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">AI Demand Forecasting</CardTitle>
            <CardDescription className="text-gray-300">
              Generate intelligent medicine demand predictions with region-aware analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-300">Medicine Name</label>
                <div className="mt-1 p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white font-medium">{data.medicine}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Region</label>
                <div className="mt-1 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{data.region}</span>
                    <Badge variant="secondary" className="text-xs">{data.regionType}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Region Type</label>
                <div className="mt-1 p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white font-medium">{data.regionType} area</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Forecasting Period</label>
                <div className="mt-1 p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white font-medium">
                    {data.period === "quarterly" ? "Quarterly (3 months)" : "Annual (12 months)"}
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Generate AI Forecast
            </button>
          </CardContent>
        </Card>

        {/* Demand Forecast Graph Panel */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Demand Forecast</CardTitle>
            <CardDescription className="text-gray-300">
              Monthly demand predictions for {data.medicine} in {data.region}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.predictions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="white"
                    fontSize={12}
                    tick={{ fill: 'white' }}
                  />
                  <YAxis 
                    stroke="white"
                    fontSize={12}
                    tick={{ fill: 'white' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${value} units`, "Demand"]}
                  />
                  <Bar dataKey="demand" fill="#3b82f6" name="Demand" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Demand Summary Panel */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">Demand Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Medicine:</span>
                <span className="font-semibold text-white">{data.medicine}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Region:</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold text-white">{data.region}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Peak Demand:</span>
                <span className="font-semibold text-white">{peakDemand} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Average Demand:</span>
                <span className="font-semibold text-white">{averageDemand} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Region Type:</span>
                <Badge variant={data.regionType === "urban" ? "default" : "secondary"}>{data.regionType} area</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Peak Month:</span>
                <span className="font-semibold text-white">{peakMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations Panel */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-white">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white">{rec}</span>
                </div>
              ))}
              
              {/* Additional AI insights based on data */}
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white">
                  Prophet model suggests {data.regionType === "urban" ? "20%" : "15%"} higher safety stock for {data.regionType} areas
                </span>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white">
                  Seasonal analysis indicates peak demand in {peakMonth}
                </span>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white">
                  Time series forecasting recommends pre-positioning inventory 1 week before peak
                </span>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white">
                  {data.regionType === "urban" ? "Urban" : "Rural"} areas show consistent demand patterns
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
