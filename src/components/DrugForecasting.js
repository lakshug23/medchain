import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ForecastForm } from "./ForecastForm";
import { ForecastResults } from "./ForecastResults";
import { SeasonalDemand } from "./SeasonalDemand";

export function DrugForecasting() {
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleForecastGenerated = (data) => {
    setForecastData(data);
  };

  const handleLoadingChange = (loading) => {
    setIsLoading(loading);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🔮 MedChain Drug Demand Forecasting
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Leverage AI-powered analytics to predict pharmaceutical demand patterns and optimize supply chain management
        </p>
      </div>

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/20">
          <TabsTrigger value="forecast" className="text-white">
            Generate Forecast
          </TabsTrigger>
          <TabsTrigger value="results" className="text-white">
            View Results
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="text-white">
            Seasonal Demand
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          <ForecastForm
            onForecastGenerated={handleForecastGenerated}
            onLoadingChange={handleLoadingChange}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <ForecastResults 
            data={forecastData} 
            isLoading={isLoading} 
          />
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <SeasonalDemand 
            selectedMedicine={forecastData?.medicine} 
            selectedRegion={forecastData?.region} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
